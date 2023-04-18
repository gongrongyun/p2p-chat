// import * as CryptoJS from 'crypto-js'

// const KEY = '_p2p_chat_'
// const IV = '1234567887654321'

export const encrypt = (data: any) => {
  return btoa(JSON.stringify(data))
  // return JSON.stringify(data)
  // const word = btoa(JSON.stringify(data))
  // let srcs = CryptoJS.enc.Utf8.parse(word)
  // let encrypted = CryptoJS.AES.encrypt(srcs, CryptoJS.enc.Utf8.parse(KEY), { 
  //   iv: CryptoJS.enc.Utf8.parse(IV), 
  //   mode: CryptoJS.mode.CBC, 
  //   padding: CryptoJS.pad.Pkcs7 
  // });
  // return encrypted.ciphertext.toString();
}

export const decrypt = (word: string) => {
  return JSON.parse(atob(word))
  // return JSON.parse(word)
  // const result = CryptoJS.AES.decrypt(word, CryptoJS.enc.Utf8.parse(KEY), {
  //   iv: CryptoJS.enc.Utf8.parse(IV),
  //   mode: CryptoJS.mode.CBC,
  //   padding: CryptoJS.pad.Pkcs7
  // })
  // return JSON.parse(atob(CryptoJS.enc.Utf8.stringify(result)))
}