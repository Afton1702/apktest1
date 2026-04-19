<script>
  import { onMount } from 'svelte';
  import { supabase } from '$lib/supabase';

  let siswa = [];
  let pembayaran = [];
  let jumlah = {};

  // load data
  const loadData = async () => {
    const { data: s, error: e1 } = await supabase.from('siswa').select('*');
    const { data: p, error: e2 } = await supabase.from('pembayaran').select('*');

    console.log('SISWA:', s, e1);
    console.log('PEMBAYARAN:', p, e2);

    siswa = s || [];
    pembayaran = p || [];
  };

  onMount(loadData);

  // hitung total
  const getTotal = (id) => {
    return pembayaran
      .filter(p => p.siswa_id === id)
      .reduce((acc, curr) => acc + (curr.jumlah || 0), 0);
  };

  const getStatus = (total) => {
    return total >= 30000 ? 'Lunas' : 'Belum';
  };

  // input pembayaran
  const bayar = async (siswa_id) => {
    if (!jumlah[siswa_id]) return;

    const { error } = await supabase
      .from('pembayaran')
      .insert({
        siswa_id,
        jumlah: parseInt(jumlah[siswa_id]),
        tanggal: new Date()
      });

    if (error) {
      console.error(error);
      alert('Gagal simpan!');
      return;
    }

    jumlah[siswa_id] = '';
    loadData();
  };

  // Tambah siswa
    let nama = '';
    let kelas = '';

    const tambahSiswa = async () => {
    if (!nama || !kelas) return;

    const { error } = await supabase.from('siswa').insert({
    nama,
    kelas
});

  if (error) {
    alert('Gagal tambah siswa');
    return;
  }

  nama = '';
  kelas = '';
  loadData();
};
    // Riwayat bayar
    let selected = null;
    let history = [];

    const lihatDetail = async (id) => {
    selected = id;

    const { data } = await supabase
        .from('pembayaran')
        .select('*')
        .eq('siswa_id', id);

    history = data || [];
};
    // Bulan
    const bulanList = [
  'Jan','Feb','Mar','Apr','Mei','Jun',
  'Jul','Agu','Sep','Okt','Nov','Des'];

    // Cari siswa
    let search = '';

    const filtered = $derived(
  siswa.filter(s =>
    s.nama.toLowerCase().includes(search.toLowerCase())
  )
);
    // Login
    let user = null;

    const checkUser = async () => {
    const { data } = await supabase.auth.getUser();
    user = data.user;
};

onMount(() => {
  checkUser();
  loadData();
});
</script>

<div class="app">
  <!-- SIDEBAR -->
  <aside class="sidebar">
    <h2>SPP App</h2>
    <ul>
      <li class="active">Dashboard</li>
      <li>Siswa</li>
      <li>Pembayaran</li>
    </ul>
  </aside>

  <!-- MAIN -->
  <main class="main">
  {#if !user}
  <div class="login">
    <h2>Login</h2>
    <input placeholder="Email" bind:value={email} />
    <input type="password" placeholder="Password" bind:value={password} />
    <button on:click={login}>Login</button>
  </div>
  {/if}
    <!-- NAVBAR -->
    <div class="navbar">
      <h1>Dashboard SPP</h1>
    </div>

    <!-- CARD STATS -->
    <div class="stats">
      <div class="card-stat">
        <p>Total Siswa</p>
        <h2>{siswa.length}</h2>
      </div>

      <div class="card-stat">
        <p>Total Pembayaran</p>
        <h2>
          Rp {pembayaran.reduce((a,b)=>a+(b.jumlah||0),0)}
        </h2>
      </div>
    </div>

    <!-- FORM -->
    <div class="form">
      <input placeholder="Nama" bind:value={nama} />
      <input placeholder="Kelas" bind:value={kelas} />
      <button on:click={tambahSiswa}>Tambah</button>

      <input
        class="search"
        placeholder="Cari siswa..."
        bind:value={search}
      />
    </div>

    <!-- TABLE -->
    <div class="table-card">
      <table>
        <thead>
          <tr>
            <th>Nama</th>
            <th>Kelas</th>
            <th>Total</th>
            <th>Status</th>
            <th>Bayar</th>
            <th>Detail</th>
          </tr>
        </thead>

        <tbody>
          {#each filtered as s}
            {@const total = getTotal(s.id)}
            <tr class={getStatus(total) === 'Belum' ? 'warning' : ''}>
              <td>{s.nama}</td>
              <td>{s.kelas}</td>
              <td>Rp {total}</td>

              <td>
                <span class="status {getStatus(total) === 'Lunas' ? 'lunas' : 'belum'}">
                  {getStatus(total)}
                </span>
              </td>

              <td>
                <input
                  type="number"
                  value={jumlah[s.id] || ''}
                  on:input={(e) => jumlah[s.id] = e.target.value}
                />
                <button on:click={() => bayar(s.id)}>✔</button>
              </td>

              <td>
                <button on:click={() => lihatDetail(s.id)}>👁</button>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>

    <!-- DETAIL -->
    {#if selected}
      <div class="detail">
        <h3>Riwayat Pembayaran</h3>
        <ul>
          {#each history as h}
            <li>{h.tanggal} - Rp {h.jumlah}</li>
          {/each}
        </ul>
      </div>
    {/if}
  </main>
</div>