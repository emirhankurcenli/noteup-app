import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

const projectRoot = process.cwd();
const p8Path = path.join(projectRoot, 'AuthKey.p8');

if (!fs.existsSync(p8Path)) {
  console.error("\n❌ Hata: 'AuthKey.p8' dosyası bulunamadı!");
  console.log("Lütfen Apple'dan indirdiğiniz .p8 dosyasını proje ana klasörüne ('AuthKey.p8' adıyla) kopyalayın.\n");
  process.exit(1);
}

const keyId = process.argv[2];
if (!keyId) {
  console.error("\n❌ Hata: Key ID belirtilmedi!");
  console.log("Kullanım: node scratch/generate_apple_secret.js <KEY_ID>");
  console.log("Örnek: node scratch/generate_apple_secret.js X89AB2CD3E\n");
  process.exit(1);
}

const privateKeyPem = fs.readFileSync(p8Path, 'utf8');
const teamId = '53M4UCGVK9';
const clientId = 'com.noteup.notes.web';

const header = { alg: 'ES256', kid: keyId, typ: 'JWT' };
const now = Math.floor(Date.now() / 1000);
const exp = now + (180 * 24 * 60 * 60);

const payload = {
  iss: teamId,
  iat: now,
  exp: exp,
  aud: 'https://appleid.apple.com',
  sub: clientId
};

const base64UrlEncode = (obj) => Buffer.from(JSON.stringify(obj)).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

const encodedHeader = base64UrlEncode(header);
const encodedPayload = base64UrlEncode(payload);
const dataToSign = `${encodedHeader}.${encodedPayload}`;

const signer = crypto.createSign('SHA256');
signer.update(dataToSign);
const signatureBuffer = signer.sign({ key: privateKeyPem, dsaEncoding: 'ieee-p1363' });
const encodedSignature = signatureBuffer.toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

const secret = `${dataToSign}.${encodedSignature}`;

console.log("\n✅ Apple Client Secret Başarıyla Üretildi! (Sadece sizin bilgisayarınızda kalır):\n");
console.log(secret);
console.log("\nYukarıdaki metni kopyalayıp Supabase 'Secret Key (for OAuth)' kutusuna yapıştırabilirsiniz.\n");
