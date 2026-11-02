
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const JwksClient = (...args) => import('jwks-client').then(({ default: JwksClient }) => JwksClient(...args));
const sign_login_fid = async function (jwtToken) {
  const fidData = jwt.decode(jwtToken, { complete: true, json: true })
  const header = Buffer.from(JSON.stringify(fidData.header)).toString('base64url')
  const payload = Buffer.from(JSON.stringify(fidData.payload)).toString('base64url')
  var currentTime = Number(Date.parse(new Date()).toString().substr(0, 10));
  if (currentTime > fidData.payload.exp) {
    console.warn('expired token')
    return false
  }

  const code = header + "." + payload
  let jwksUri = 'YOUR_REMOTE_FID_URL'
  let publicKey = await getjwks(fidData.header.kid, jwksUri)

  const buffer = Buffer.from(fidData.signature, 'base64');

  const isVerified = crypto.verify(
    "sha256",
    Buffer.from(code),
    {
      key: publicKey,
    },
    buffer
  )
  console.log(isVerified)
  return isVerified
}





async function getjwks(kid, jwksUri) {
  const client = await JwksClient({
    strictSsl: true, // Default value
    jwksUri: jwksUri

  });
  let signingKey = await new Promise((resolve, reject) => {
    client.getSigningKey(kid, (err, key) => {
      if (err || !key) {
        reject(undefined)
        return
      }
      const signingKey = key.publicKey;
      resolve(signingKey)
    });
  })

  return signingKey

}
async function main() {
  let jwksUri = 'YOUR_REMOTE_FID_URL'
  let jwtToken = "YOUR_ACCESS_TOKEN"
  //await getjwks("0FEDFE9E99A4C1866E35D4E3280E88DE86B52459RS256", jwksUri)
  await sign_login_fid(jwtToken)
  console.log('all test accept √');
}

main().catch(console.error);