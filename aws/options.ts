const awsRegion = process.env.DO_SPACES_MEDIA_REGION || ''
const accessKeyId = process.env.DO_SPACES_MEDIA_KEY || ''
const secretAccessKey = process.env.DO_SPACES_MEDIA_SECRET || ''
const bucketName = process.env.DO_SPACES_MEDIA_BUCKET || ''
const endpoint = `https://${awsRegion}.digitaloceanspaces.com`
const originEndpoint = `https://${bucketName}.${awsRegion}.digitaloceanspaces.com`
const cdnEndpoint = `https://${bucketName}.${awsRegion}.cdn.digitaloceanspaces.com`
const imgixEndpoint = `https://${bucketName}.imgix.net`

const options = {
  awsRegion,
  accessKeyId,
  secretAccessKey,
  bucketName,
  endpoint,
  originEndpoint,
  cdnEndpoint,
  imgixEndpoint
}

export default options
export {
  awsRegion,
  accessKeyId,
  secretAccessKey,
  bucketName,
  endpoint,
  originEndpoint,
  cdnEndpoint,
  imgixEndpoint
}
