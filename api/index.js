const uri = 'https://malaysia.give.asia/campaign/help-raaina-aluna-nugroho-5676'
const cors = `https://ootopi-cors-proxy.herokuapp.com/${uri}`

fetch(cors).then(e => console.log(e))