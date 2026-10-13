// Kelola pengguna TOKOKU Lite.
// aksi "awal"  : tanpa login; hanya berhasil bila belum ada pengguna sama sekali → membuat kasir/1234 (Pemilik).
// aksi "tambah": pemilik; membuat pengguna baru (nama, username, pin, peran).
// aksi "ubah"  : pemilik; ubah nama/username/peran/pin/aktif.
import { createClient } from "npm:@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const jawab = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...CORS, "Content-Type": "application/json" } });

const URL_SB = Deno.env.get("SUPABASE_URL")!;
function kunciRahasia(): string {
  const lama = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (lama) return lama;
  return JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS")!)["default"];
}
const admin = createClient(URL_SB, kunciRahasia(), { auth: { persistSession: false, autoRefreshToken: false } });

export const emailDari = (u: string) => `${u}@tokoku-lite.example.com`;
export const sandiDari = (pin: string) => `TKL#${pin}#lite`;
const USERNAME = /^[a-z0-9._-]{3,20}$/;
const PIN = /^\d{4,6}$/;

async function pemanggil(req: Request) {
  const token = (req.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "");
  if (!token) return null;
  const { data, error } = await admin.auth.getUser(token);
  if (error || !data.user) return null;
  const { data: p } = await admin.from("pengguna").select("*").eq("id", data.user.id).maybeSingle();
  return p;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return jawab({ error: "Metode tidak didukung" }, 405);
  let b: Record<string, unknown>;
  try { b = await req.json(); } catch { return jawab({ error: "Isi permintaan tidak valid" }, 400); }
  const aksi = String(b.aksi || "");

  try {
    if (aksi === "awal") {
      const { count, error } = await admin.from("pengguna").select("id", { count: "exact", head: true });
      if (error) throw error;
      if ((count ?? 0) > 0) return jawab({ error: "Sudah ada pengguna" }, 409);
      const { data: u, error: e1 } = await admin.auth.admin.createUser({
        email: emailDari("kasir"), password: sandiDari("1234"), email_confirm: true,
      });
      if (e1) throw e1;
      const { error: e2 } = await admin.from("pengguna").insert({ id: u.user.id, nama: "Kasir", username: "kasir", peran: "pemilik" });
      if (e2) throw e2;
      return jawab({ ok: true });
    }

    const saya = await pemanggil(req);
    if (!saya || !saya.aktif || saya.peran !== "pemilik") return jawab({ error: "Hanya pemilik yang boleh mengatur pengguna" }, 403);

    if (aksi === "tambah") {
      const nama = String(b.nama || "").trim();
      const username = String(b.username || "").trim().toLowerCase();
      const pin = String(b.pin || "");
      const peran = b.peran === "pemilik" ? "pemilik" : "admin";
      if (!nama) return jawab({ error: "Isi nama" }, 400);
      if (!USERNAME.test(username)) return jawab({ error: "Nama pengguna 3–20 huruf kecil/angka, tanpa spasi" }, 400);
      if (!PIN.test(pin)) return jawab({ error: "PIN harus 4–6 angka" }, 400);
      const { data: ada } = await admin.from("pengguna").select("id").eq("username", username).maybeSingle();
      if (ada) return jawab({ error: "Nama pengguna sudah dipakai" }, 409);
      const { data: u, error: e1 } = await admin.auth.admin.createUser({ email: emailDari(username), password: sandiDari(pin), email_confirm: true });
      if (e1) throw e1;
      const { error: e2 } = await admin.from("pengguna").insert({ id: u.user.id, nama, username, peran });
      if (e2) { await admin.auth.admin.deleteUser(u.user.id); throw e2; }
      return jawab({ ok: true, id: u.user.id });
    }

    if (aksi === "ubah") {
      const id = String(b.id || "");
      const { data: lama } = await admin.from("pengguna").select("*").eq("id", id).maybeSingle();
      if (!lama) return jawab({ error: "Pengguna tidak ditemukan" }, 404);
      const baru = { ...lama } as Record<string, unknown>;
      if (b.nama !== undefined) { const n = String(b.nama).trim(); if (!n) return jawab({ error: "Isi nama" }, 400); baru.nama = n; }
      if (b.username !== undefined) {
        const u = String(b.username).trim().toLowerCase();
        if (!USERNAME.test(u)) return jawab({ error: "Nama pengguna 3–20 huruf kecil/angka, tanpa spasi" }, 400);
        if (u !== lama.username) { const { data: ada } = await admin.from("pengguna").select("id").eq("username", u).maybeSingle(); if (ada) return jawab({ error: "Nama pengguna sudah dipakai" }, 409); }
        baru.username = u;
      }
      if (b.peran !== undefined) baru.peran = b.peran === "pemilik" ? "pemilik" : "admin";
      if (b.aktif !== undefined) baru.aktif = !!b.aktif;
      if (id === saya.id && (baru.aktif === false || baru.peran !== "pemilik")) return jawab({ error: "Tidak bisa menonaktifkan atau menurunkan peran akun sendiri" }, 400);
      if (lama.peran === "pemilik" && lama.aktif && (baru.peran !== "pemilik" || baru.aktif === false)) {
        const { count } = await admin.from("pengguna").select("id", { count: "exact", head: true }).eq("peran", "pemilik").eq("aktif", true).neq("id", id);
        if (!count) return jawab({ error: "Harus ada minimal satu Pemilik aktif" }, 400);
      }
      const pinBaru = b.pin ? String(b.pin) : "";
      if (pinBaru && !PIN.test(pinBaru)) return jawab({ error: "PIN harus 4–6 angka" }, 400);
      const ubahAuth: Record<string, unknown> = {};
      if (baru.username !== lama.username) { ubahAuth.email = emailDari(String(baru.username)); ubahAuth.email_confirm = true; }
      if (pinBaru) ubahAuth.password = sandiDari(pinBaru);
      if (baru.aktif !== lama.aktif) ubahAuth.ban_duration = baru.aktif ? "none" : "876000h";
      if (Object.keys(ubahAuth).length) { const { error } = await admin.auth.admin.updateUserById(id, ubahAuth); if (error) throw error; }
      const { error: e2 } = await admin.from("pengguna").update({ nama: baru.nama, username: baru.username, peran: baru.peran, aktif: baru.aktif }).eq("id", id);
      if (e2) throw e2;
      return jawab({ ok: true });
    }

    return jawab({ error: "Aksi tidak dikenal" }, 400);
  } catch (e) {
    console.error(e);
    return jawab({ error: (e as Error)?.message || "Gagal" }, 500);
  }
});
