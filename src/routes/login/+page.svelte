<script>
  import { supabase } from '$lib/supabase';
  import { goto } from '$app/navigation';

  let mode = $state('guru'); // guru / siswa

  let email = $state('');
  let password = $state('');
  let nama = $state('');

  async function login() {
  // =====================
  // LOGIN GURU
  // =====================
  if (mode === 'guru') {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      alert('Login guru gagal');
      return;
    }

    localStorage.setItem('role', 'guru');
    goto('/');
  }

  // =====================
  // LOGIN SISWA
  // =====================
  if (mode === 'siswa') {
    const { data, error } = await supabase
      .from('siswa')
      .select('*')
      .eq('nama', nama.trim())
      .eq('password', password.trim());

    console.log('DATA SISWA:', data);

    if (error) {
      console.error(error);
      alert('Terjadi error');
      return;
    }

    if (!data || data.length === 0) {
      alert('Login siswa gagal');
      return;
    }

    const siswa = data[0];

    localStorage.setItem('role', 'siswa');
    localStorage.setItem('siswa_id', siswa.id);

    console.log('LOGIN BERHASIL:', siswa);

    return goto(`/siswa/${siswa.id}`);
  }
}
</script>

<div class="container">

  <!-- LEFT -->
  <div class="left">
    <h1>Login</h1>

    <select bind:value={mode}>
      <option value="guru">Guru</option>
      <option value="siswa">Siswa</option>
    </select>

    {#if mode === 'guru'}
      <input placeholder="Email" bind:value={email} />
      <input type="password" placeholder="Password" bind:value={password} />
    {/if}

    {#if mode === 'siswa'}
      <input placeholder="Nama lengkap" bind:value={nama} />
      <input type="password" placeholder="Password" bind:value={password} />
    {/if}

    <button on:click={login}>Login</button>
  </div>

  <!-- RIGHT -->
  <div class="right">
    <div class="right-content">
      <h2>I'ANAH YTPNU</h2>
      <p>YAYASAN TAMAN PENDIDIKAN NAHDLATUL ULAMA LEKOK</p>

      <img src="/logo sdnu.png" class="logo" />

      <p class="school">SD NU LEKOK</p>
    </div>
  </div>

</div>
<style>
.container {
  display: flex;
  height: 90vh;               
  max-width: 900px;           
  margin: auto;             
  margin-top: 5vh;

  border-radius: 20px;
  overflow: hidden;

  box-shadow: 0 20px 60px rgba(0,0,0,0.2);
}

/* ===== LEFT ===== */
.left {
  flex: 1;
  background: #f8fafc;

  display: flex;
  flex-direction: column;
  justify-content: center;

  padding: 40px;
}

.left h1 {
  font-size: 26px;
}

.left input,
.left select {
  margin: 10px 0;
  padding: 12px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
}

.left button {
  margin-top: 15px;
  padding: 12px;
  border: none;
  border-radius: 999px;
  background: #5fc685;
  color: white;
  font-weight: 600;
  cursor: pointer;
  font-size: 20px;
}

/* ===== RIGHT ===== */
.right {
  flex: 1;
  background: linear-gradient(135deg, #5fc685, #558462);

  display: flex;
  justify-content: center;
  align-items: center;

  border-top-left-radius: 60px;
  border-bottom-left-radius: 60px;
}

/* konten kanan */
.right-content {
  text-align: center;
  max-width: 300px;
}

.right h2 {
  font-size: 34px;
  color: white;
}

.right p {
  font-size: 20px;
  color: white;
}

/* logo */
.logo {
  width: 130px;    
  margin: 20px 0;
}

/* nama sekolah */
.school {
  font-weight: bold;
  margin-top: 10px;
  color: white;
}
@media (max-width: 768px) {
  .container {
    flex-direction: column;
    height: auto;
    max-width: 95%;
  }

  .right {
    border-radius: 0;
    padding: 30px 20px;
  }

  .left {
    padding: 25px;
  }
}
</style>