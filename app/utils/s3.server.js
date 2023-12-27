import { S3 } from 'aws-sdk'

const { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION, AWS_S3_BUCKET_NAME } = process.env

if (!AWS_ACCESS_KEY_ID) throw new Error('Missing AWS Access Key ID in environment variables.')
if (!AWS_SECRET_ACCESS_KEY) throw new Error('Missing AWS Secret Access Key in environment variables.')
if (!AWS_REGION) throw new Error('Missing AWS Region setting in environment variables.')
if (!AWS_S3_BUCKET_NAME) throw new Error('Missing AWS S3 Bucket name in environment variables.')
const bucketName = AWS_S3_BUCKET_NAME

const s3 = new S3()

// export async function getImages(token, seriesId, chapterId) {
//   const childItems = await fetchOnedrive(`${seriesId}/${chapterId}:/children`, token)

//   const images = childItems.value.map(imageItem => imageItem.name).filter(file => /^Img-([0-9]+)/.exec(file) !== null)
//   images.sort(
//     (fA, fB) => Number.parseInt(/^Img-([0-9]+)/.exec(fA)[1], 10) - Number.parseInt(/Img-([0-9]+)/.exec(fB)[1], 10)
//   )
//   return images
// }

export function listImagesForChapter(seriesId, chapterId) {
  return new Promise((res, rej) => {
    s3.listObjectsV2({ Bucket: bucketName, Prefix: `${seriesId}/${chapterId}` }, (err, data) => {
      if (err) rej(err)
      else {
        const images = data.Contents.map(item => item.Key).filter(file => /Img-([0-9]+)/.exec(file) !== null)
        images.sort(
          (fA, fB) => Number.parseInt(/Img-([0-9]+)/.exec(fA)[1], 10) - Number.parseInt(/Img-([0-9]+)/.exec(fB)[1], 10)
        )
        res(images.map(image => s3.getSignedUrl('getObject', { Bucket: bucketName, Key: image })))
      }
    })
  })
}

export function deleteAllFilesForChapter(seriesId, chapterId) {
  return new Promise((res, rej) => {
    s3.listObjectsV2({ Bucket: bucketName, Prefix: `${seriesId}/${chapterId}` }, (err, data) => {
      if (err) rej(err)
      else {
        let deleteParams = { Bucket: bucketName, Delete: { Objects: [] } }
        data.Contents.forEach(({ Key }) => {
          deleteParams.Delete.Objects.push({ Key })
        })

        s3.deleteObjects(deleteParams, err => {
          if (err) rej(err)
          else res()
        })
      }
    })
  })
}

export function getThumbnailSrc(seriesId) {
  return s3.getSignedUrl('getObject', { Bucket: bucketName, Key: `${seriesId}/Thumbnail.jpg` })
}
