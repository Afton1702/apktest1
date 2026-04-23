<script>
  import { onMount } from 'svelte';
  import { supabase } from '$lib/supabase';
  import { goto } from '$app/navigation';
  import * as XLSX from 'xlsx';


  let siswa = $state([]);
  let pembayaran = $state([]);

  let nama = '';
  let passwordSiswa = '';

  let openSiswa = $state(false);
  let kelasAktif = $state(1);
  let noAbsen = '';

  let role = $state(null);

  onMount(() => {
    role = localStorage.getItem('role');

    if (!role) {
      goto('/login');
    }

    loadData();
  });

  const siswaKelas = () =>
  siswa
    .filter(s => Number(s.kelas) === Number(kelasAktif))
    .sort((a, b) => a.nama.localeCompare(b.nama));
  

  onMount(loadData);

  async function loadData() {
  const { data: s } = await supabase.from('siswa').select('*');
  const { data: p } = await supabase.from('pembayaran').select('*');

  siswa = [...(s || [])];
  pembayaran = [...(p || [])];
}

  const tambahSiswa = async () => {
  if (!nama || !noAbsen) {
    alert('Nama & No Absen wajib');
    return;
  }

  const { error } = await supabase.from('siswa').insert({
    nama,
    kelas: kelasAktif,
    password: passwordSiswa,
    no_absen: parseInt(noAbsen)
  });

  if (error) {
    alert(error.message);
    return;
  }

  nama = '';
  passwordSiswa = '';
  noAbsen = '';

  await loadData();
};

  const siswaTampil = () => {
  if (role === 'siswa') {
    const id = localStorage.getItem('siswa_id');
    return siswa.filter(s => s.id === id);
  }
  return siswaKelas();
};

  function totalSiswa(id) {
    return pembayaran
      .filter(p => p.siswa_id === id)
      .reduce((a,b)=>a+(b.jumlah||0),0);
  }

  function status(total) {
    return total >= 30000 ? 'Lunas' : 'Belum';
  }

  async function logout() {
  await supabase.auth.signOut();
  localStorage.clear();
  goto('/login');
}

async function exportExcel(kelas) {
  //  ambil siswa
  const { data: siswa } = await supabase
    .from('siswa')
    .select('*')
    .eq('kelas', kelas)
    .order('no_absen', { ascending: true });

  //  ambil pembayaran
  const { data: pembayaran } = await supabase
    .from('pembayaran')
    .select('*');

  // bulan list
  const bulanList = [
    'Jan','Feb','Mar','Apr','Mei','Jun',
    'Jul','Agu','Sep','Okt','Nov','Des'
  ];

  //  mapping data
  const result = siswa.map(s => {
    let row = {
      Nama: s.nama,
      "No Absen": s.no_absen
    };

    bulanList.forEach(bulan => {
      const total = pembayaran
        .filter(p =>
          p.siswa_id === s.id &&
          p.bulan.toLowerCase() === bulan.toLowerCase()
        )
        .reduce((a, b) => a + (b.jumlah || 0), 0);

      row[bulan] = total;
    });

    return row;
  });

  // 🔥 convert ke excel
  const ws = XLSX.utils.json_to_sheet(result);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, `Kelas ${kelas}`);

  XLSX.writeFile(wb, `SPP_Kelas_${kelas}.xlsx`);
}
</script>

<div class="app">

  <aside class="sidebar">
    <h2>SPP App</h2>

      <ul>
        <li on:click={() => openSiswa = !openSiswa}>
          Siswa {openSiswa ? '▼' : '▶'}
        </li>

        {#if openSiswa}
          <ul class="submenu">
            {#each [1,2,3,4,5,6] as k}
              <li on:click={() => kelasAktif = k}>
                Kelas {k}
              </li>
            {/each}
          </ul>
        {/if}
      </ul>

      <button class="logout" on:click={logout}>
  Logout
</button>
  </aside>

  <main class="main">
    <h1>Kelas {kelasAktif}</h1>
    {#if role === 'guru'}
      <div class="form">
        <input placeholder="Nama" bind:value={nama} />
        <input placeholder="Password" bind:value={passwordSiswa} />
        <input placeholder="No Absen" type="number" bind:value={noAbsen} />
        <button on:click={tambahSiswa}>Tambah</button>
        <button on:click={() => exportExcel(1)}>
          Export Excel
        </button>
      </div>
    {/if}

    <div class="table-card">
      <table>
        <thead>
          <tr>
            <th>Nama</th>
            <th>No Absen</th>
          </tr>
        </thead>

        <tbody>
          {#each siswaKelas() as s}
            <tr>
              <td>
                <a href={`/siswa/${s.id}`}>{s.nama}</a>
              </td>
              <td>{s.no_absen}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </main>
</div>