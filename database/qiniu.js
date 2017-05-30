const qiniu = require('qiniu')

qiniu.conf.ACCESS_KEY = 'mfofEFD0_hheVa5rsz_3azDXkEe464a-fGcebNIV'
qiniu.conf.SECRET_KEY = '4aWlyTwpfkze86P8s9txp3VvgIcHe8gQSMJj5fju'


//构建上传策略函数
function uptoken(key) {
  const putPolicy = new qiniu.rs.PutPolicy("stand-up-comedian-wiki:" + key);
  return putPolicy.token();
}

module.exports = function uploadFile(localFilePath, uploadedFileName) {
  const token = uptoken(uploadedFileName)
  const key = uploadedFileName
  const extra = new qiniu.io.PutExtra();
  return new Promise((resolve, reject) => {
    qiniu.io.putFile(token, key, localFilePath, extra, function(err, ret) {
      if(!err) {
        // 上传成功， 处理返回值
        resolve(`http://olrzfbqqd.bkt.clouddn.com/${ret.key}`)
      } else {
        // 上传失败， 处理返回代码
        console.log(`upload failed ${JSON.stringify(err)}`, ret)
        reject()
      }
    });
  })
}
