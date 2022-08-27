const uri = 'https://malaysia.give.asia/campaign/help-raaina-aluna-nugroho-5676'
const cors = `https://test.cors.workers.dev/?${uri}`

fetch(cors)
    .then(e => e.json())
    .then(console.log)
    // .then(json => {
    //     const dom_parser = new DOMParser()
    //     const scripts = Array.from(dom_parser.parseFromString(json.contents, 'text/html').querySelectorAll('script'))
    //     return {
    //         'campaign': JSON.parse(atob(scripts.filter(x => x.innerHTML.indexOf('el: \'#campaignSettings\'') > -1)[0].innerHTML.match(/parse\(\"([^"]+)\"\)/)[1])),
    //         'csrf': scripts.filter(x => x.innerHTML.indexOf('Csrf-Token') > -1)[0].innerHTML.match(/this.setRequestHeader\(\'Csrf-Token\', \'([^']+)\'/)[1]
    //     }
    // })
    // .then(({campaign, csrf}) => {
    //     console.log(campaign, csrf)
    //     fetch("https://test.cors.workers.dev/?url=https://malaysia.give.asia/campaign/help-raaina-aluna-nugroho-5676/activities", {
    //         "headers": {
    //           "accept": "application/json, text/plain, */*",
    //           "accept-language": "en-US,en;q=0.9",
    //           "content-type": "application/json;charset=UTF-8",
    //           "sec-ch-ua": "\"Chromium\";v=\"104\", \" Not A;Brand\";v=\"99\", \"Google Chrome\";v=\"104\"",
    //           "sec-ch-ua-mobile": "?0",
    //           "sec-ch-ua-platform": "\"Windows\"",
    //           "sec-fetch-dest": "empty",
    //           "sec-fetch-mode": "cors",
    //           "sec-fetch-site": "same-origin",
    //           "csrf-token": csrf,
    //         },
    //         "referrer": "https://malaysia.give.asia/campaign/help-raaina-aluna-nugroho-5676",
    //         "body": "{\"exclusiveMaxCreatedAt\":1661565592}",
    //         "method": "POST",
    //         "credentials": "include"
    //       }).then(e => console.log(e))
    // })