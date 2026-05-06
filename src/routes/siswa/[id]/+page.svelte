<script>
  import { onMount } from 'svelte';
  import { supabase } from '$lib/supabase';
  import { goto } from '$app/navigation';

  let { params } = $props();

  let role = $state('');
  let siswaLogin = '';
  let siswaId = '';
  let namaSiswa = $state('');

  let pembayaran = $state([]);
  let nominal = $state({});

  const bulanList = [
    'Jan','Feb','Mar','Apr','Mei','Jun',
    'Jul','Agu','Sep','Okt','Nov','Des'
  ];

  onMount(async () => {
    role = localStorage.getItem('role') || '';
    siswaLogin = localStorage.getItem('siswa_id') || '';

    // proteksi siswa
    if (role === 'siswa' && String(siswaLogin) !== String(params.id)) {
      alert('Tidak boleh akses siswa lain');
      goto('/');
      return;
    }

    siswaId = role === 'siswa' ? siswaLogin : params.id;

    console.log('ROLE:', role);
    console.log('ID:', siswaId);

    await loadData();
  });

  async function loadData() {
  console.log('FETCH ID:', siswaId);

  const { data: siswaData, error: errSiswa } = await supabase
    .from('siswa')
    .select('id, nama')
    .eq('id', siswaId)
    .maybeSingle();

  console.log('SISWA RESULT:', siswaData);

  if (errSiswa) {
    console.error(errSiswa);
  }

  if (siswaData) {
    namaSiswa = siswaData.nama;
  } else {
    namaSiswa = '-';
  }

  const { data: bayarData } = await supabase
    .from('pembayaran')
    .select('*')
    .eq('siswa_id', siswaId);

  pembayaran = bayarData || [];
}

  function normalize(bulan) {
    return (bulan || '').toString().trim().toLowerCase();
  }

  function getHariList(bulan) {
    const data = pembayaran
      .filter(p => normalize(p.bulan) === normalize(bulan));

    const hari = Array(31).fill(null);

    data.forEach((d, i) => {
      if (i < 31) hari[i] = d.jumlah;
    });

    return hari;
  }

  function totalBulanan(bulan) {
    return pembayaran
      .filter(p => normalize(p.bulan) === normalize(bulan))
      .reduce((a,b)=>a+(b.jumlah||0),0);
  }

  function isLunas(bulan) {
    return totalBulanan(bulan) >= 30000;
  }

  async function bayar(bulan) {
    if (role !== 'guru') {
      alert('Bukan guru!');
      return;
    }

    if (!nominal[bulan]) {
      alert('Isi nominal dulu');
      return;
    }

    const { error } = await supabase
      .from('pembayaran')
      .insert({
        siswa_id: siswaId,
        bulan,
        tahun: 2026,
        jumlah: parseInt(nominal[bulan])
      });

    if (error) {
      alert(error.message);
      return;
    }

    nominal[bulan] = '';
    await loadData();
  }
</script>

<h1 class="judul">
  Detail Pembayaran
</h1>

<p class="nama">
  Siswa: <b>{namaSiswa || '-'}</b>
</p>

<div class="bulan-wrapper">
  {#each bulanList as b}
    <div class={`bulan-card ${isLunas(b) ? 'lunas' : ''}`}>

  {#if isLunas(b)}
    <div class="lunas-label">LUNAS</div>
  {/if}

      <h2>{b}</h2>
      <p>Total: Rp {totalBulanan(b)}</p>

      {#if role === 'guru'}
        <input
          type="number"
          bind:value={nominal[b]}
          placeholder="Nominal"
        />
        <button on:click={() => bayar(b)}>
          Bayar
        </button>
        {:else}
        <p style="color:#64748b">Hanya melihat</p>
      {/if}

      <div class="grid">
        {#each getHariList(b) as h}
          <div class={`box ${h ? 'filled' : ''}`}>
            {h || ''}
          </div>
        {/each}
      </div>

    </div>
  {/each}
</div>

<style>
body {
  padding: 10px;
}
/* ===== HEADER ===== */
.judul {
  font-size: 34px;
  font-weight: 800;
  color: #0f172a;
  margin-bottom: 10px;
}

.nama {
  font-size: 18px;
  color: #64748b;
  margin-bottom: 30px;
}

.nama b {
  color: #4f46e5;
}

/* ===== WRAPPER BULAN ===== */
.bulan-wrapper {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 24px;
}

/* ===== CARD ===== */
.bulan-card {
  background: #f8fafc;
  padding: 16px;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  transition: 0.2s;
  position: relative;
  overflow: visible; 
  height: auto;      
}

.bulan-card:hover {
  transform: translateY(-3px);
}

/* ===== LUNAS ===== */
.bulan-card.lunas {
  border: 2px solid #22c55e;
  background: #f0fdf4;
  animation: glow 1s ease;
}

@keyframes glow {
  0% {
    box-shadow: 0 0 0 rgba(34,197,94,0);
  }
  50% {
    box-shadow: 0 0 20px rgba(34,197,94,0.4);
  }
  100% {
    box-shadow: 0 0 0 rgba(34,197,94,0);
  }
}

.bulan-card.lunas:hover {
  transform: scale(1.02);
  transition: 0.2s;
}

.lunas-label {
  position: absolute;
  top: 10px;
  right: 10px;

  background: #22c55e;
  color: white;

  font-size: 12px;
  font-weight: 700;

  padding: 6px 12px;
  border-radius: 999px;

  animation: popIn 0.4s ease;
  box-shadow: 0 0 0 rgba(34,197,94,0.6);
}

/* animasi masuk */
@keyframes popIn {
  0% {
    transform: scale(0.5);
    opacity: 0;
  }
  70% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

/* ===== JUDUL BULAN ===== */
.bulan-card h2 {
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 5px;
}

.bulan-card p {
  color: #64748b;
  margin-bottom: 10px;
}

/* ===== INPUT ===== */
.bulan-card input {
  width: 100%;
  padding: 10px;
  border-radius: 10px;
  border: 1px solid #cbd5f5;
  margin-bottom: 10px;
  outline: none;
}

/* ===== BUTTON ===== */
.bulan-card button {
  width: 100%;
  padding: 10px;
  border-radius: 10px;
  background: #4f46e5;
  color: white;
  border: none;
  cursor: pointer;
  transition: 0.2s;
}

.bulan-card button:hover {
  background: #4338ca;
}

/* ===== GRID KOTAK ===== */
.grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 10px;
  margin-top: 15px;
  grid-auto-rows: 1fr; 
}

/* ===== BOX ===== */
.box {
  aspect-ratio: 1 / 1;
  background: #e2e8f0;
  border-radius: 10px;

  display: flex;
  align-items: center;
  justify-content: center;

  font-size: 13px;
  font-weight: 600;
  color: #475569;

  width: 100%;
}

/* ===== BOX TERISI ===== */
.box.filled {
  background: linear-gradient(135deg, #6366f1, #4f46e5);
  color: white;
}

/* ===== MOBILE ===== */
@media (max-width: 600px) {
  .bulan-wrapper {
    grid-template-columns: 1fr; /* 1 kolom aja */
  }

  .bulan-card {
    padding: 14px;
  }

  .grid {
    grid-template-columns: repeat(4, 1fr); /* dari 6 jadi 4 */
    gap: 8px;
  }

  .box {
    font-size: 11px;
  }

  .judul {
    font-size: 24px;
  }
}
</style>