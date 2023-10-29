const proxy = uri => `https://corsproxy.io?${uri}`
const base_uri = proxy('https://give.asia/campaign/chero-celebrates-her-birthday-with-project-green-ribbon')
const activities_uri = `${base_uri}/activities`

const div = _ => document.createElement('div')
const span = _ => document.createElement('span')

let donations = []

const dom_donations = div()
dom_donations.id = 'donations'

let donations_dom = []

const dom_donation_bar = div()
dom_donation_bar.id = 'donation-bar'
document.body.appendChild(dom_donation_bar)

const dom_donation_progress = div()
dom_donation_progress.classList.toggle('progress')
dom_donation_bar.appendChild(dom_donation_progress)

const dom_donation_status = div()
dom_donation_status.classList.toggle('status')
dom_donation_bar.appendChild(dom_donation_status)

let dom_alert_wrapper = document.createElement('div')
dom_alert_wrapper.id = 'donation-alert-wrapper'
document.body.appendChild(dom_alert_wrapper)

let dom_donation_alert = document.createElement('div')
dom_donation_alert.id = 'donation-alert'
dom_donation_alert.classList.toggle('hidden', true)

dom_alert_wrapper.appendChild(dom_donation_alert)

const dom_donation_image = document.createElement('div')
dom_donation_image.classList.toggle('image', true)
dom_donation_alert.appendChild(dom_donation_image)

const dom_donation_alert_name = document.createElement('span')
dom_donation_alert_name.classList.toggle('name', true)
dom_donation_alert.appendChild(dom_donation_alert_name)

const dom_donation_alert_amount_prefix = document.createElement('span')
dom_donation_alert_amount_prefix.classList.toggle('amount_prefix', true)
dom_donation_alert.appendChild(dom_donation_alert_amount_prefix)
const dom_donation_alert_amount = document.createElement('span')
dom_donation_alert_amount.classList.toggle('amount', true)
dom_donation_alert.appendChild(dom_donation_alert_amount)
const dom_donation_alert_msg = document.createElement('span')
dom_donation_alert_msg.classList.toggle('message', true)
dom_donation_alert.appendChild(dom_donation_alert_msg)

const time_intervals = [
    { label: 'year', seconds: 31536000 },
    { label: 'month', seconds: 2592000 },
    { label: 'day', seconds: 86400 },
    { label: 'hour', seconds: 3600 },
    { label: 'minute', seconds: 60 },
    { label: 'second', seconds: 1 }
]

document.body.appendChild(dom_donations)

let trigger_queue = []
let triggering = false
let updating = false
let timeout
let counter = 0
let last_update = Date.now()
let discrepency = 0

const donation_alert_sfx = new Audio('./media/ka-ching.mp3')
let audio_context = new AudioContext()

const source = audio_context.createMediaElementSource(donation_alert_sfx)
source.connect(audio_context.destination)

document.body.addEventListener('click', _ => {
    audio_context.resume()
})

function add_to_trigger_queue(entry, replay = false) {
    trigger_queue.push(entry)
    if(!triggering) trigger()
}

get_campaign_data()
    .then(({campaign}) => {
        console.log(campaign)
        console.log(`Campaign started on ${new Date(campaign.publishedAt * 1000)}`)
        console.log(`Total donations: ${campaign.donationCount}`)
        console.log(`${campaign.totalDonationAmountCents/100} ${campaign.currency} / ${campaign.targetAmountCents/100} ${campaign.currency} raised`)

        const percentage = (campaign.totalDonationAmountCents + campaign.offlineAmountCents) / campaign.targetAmountCents * 100
        dom_donation_progress.style.width = `${Math.min(100, percentage)}%`
        dom_donation_status.innerHTML = `<b>${((campaign.totalDonationAmountCents+campaign.offlineAmountCents)/100).toLocaleString()} ${campaign.currency}</b> ${(campaign.offlineAmountCents ? `(inc. ${(campaign.offlineAmountCents/100).toLocaleString()} ${campaign.currency} offline) ` : '')}of ${(campaign.targetAmountCents/100).toLocaleString()} ${campaign.currency} raised`
        get_donation_data(campaign.donationCount)
            .then((json) => {
                const {activities} = json
                donations = activities.reverse()
                donations.forEach(add_dom_donation)
                discrepency = campaign.donationCount - donations.length
                setInterval(update_dom_donations, 1000)
                trigger()
            })
    })

function update() {
    if(updating) return
    last_update = Date.now()
    updating = true
    console.log('updating', Date.now())

    return get_campaign_data().then(({campaign}) => {
        console.log('stopped updating', Date.now(), campaign.donationCount, donations.length)
        if(campaign.donationCount > donations.length + discrepency) {
            const percentage = (campaign.totalDonationAmountCents + campaign.offlineAmountCents) / campaign.targetAmountCents * 100
            dom_donation_progress.style.width = `${Math.min(100, percentage)}%`
            dom_donation_status.innerHTML = `<b>${((campaign.totalDonationAmountCents+campaign.offlineAmountCents)/100).toLocaleString()} ${campaign.currency}</b> ${(campaign.offlineAmountCents ? `(inc. ${(campaign.offlineAmountCents/100).toLocaleString()} ${campaign.currency} offline) ` : '')}of ${(campaign.targetAmountCents/100).toLocaleString()} ${campaign.currency} raised`
            
            const difference = campaign.donationCount - (donations.length + discrepency)
            console.log('fetching new donations', difference)
            get_donation_data(difference).then((e) => {
                updating = false
                const {activities} = e
                activities.reverse()
                activities.forEach(entry => {
                    const exists = donations.find(x => x.createdAt == entry.createdAt && x.donorUserId == entry.donorUserId)
                    if(exists) return
                    console.log(entry)
                    donations.push(entry)
                    add_dom_donation(entry)
                    add_to_trigger_queue(entry)
                })
            })
        } else {
            updating = false
        }
    }).then(trigger).catch(e => update)
}

function time_since(date) {
    const seconds = Math.max(1, Math.floor((Date.now() - date.getTime()) / 1000))
    const interval = time_intervals.find(i => i.seconds <= seconds)
    const count = Math.floor(seconds / interval.seconds)
    return `${count} ${interval.label}${count !== 1 ? 's' : ''} ago`
}

function add_dom_donation(entry) {
    const {amountCents, comment, createdAt, currency, donorIsAnonymous, donorProfilePhotoUrl, donorUserId, donorName, donorUserUrl} = entry
    const dom = document.createElement('div')
    dom.classList.toggle('donation')
    dom_donations.insertBefore(dom, dom_donations.firstChild)

    const dom_donor_name = document.createElement('span')
    dom_donor_name.classList.toggle('donor-name')
    dom.appendChild(dom_donor_name)
    dom_donor_name.textContent = `${donorIsAnonymous ? 'Anonymous' : donorName}`

    const dom_amount = document.createElement('span')
    dom_amount.classList.toggle('donation-amount')
    dom.appendChild(dom_amount)
    const amount = amountCents / 100
    const has_decimal = Math.round(amount) != amount
    dom_amount.textContent = `${has_decimal ? amount.toFixed(2) : amount} ${currency}`

    const dom_time_since = document.createElement('span')
    dom_time_since.classList.toggle('donation-time-since')
    dom.appendChild(dom_time_since)
    dom_time_since.textContent = time_since(new Date(createdAt * 1000))

    dom._entry = entry
    dom.addEventListener('click', _ => add_to_trigger_queue(entry, true))
    donations_dom.push(dom)
    dom_donations.scrollTop = 0
}

function update_dom_donations() {
    donations_dom.forEach(dom => {
        const {amountCents, comment, createdAt, currency, donorIsAnonymous, donorProfilePhotoUrl, donorUserId, donorName, donorUserUrl} = dom._entry
        const dom_time_since = dom.querySelector('.donation-time-since')
        dom_time_since.textContent = time_since(new Date(createdAt * 1000))
    })
}

function get_campaign_data() {
    return fetch(base_uri)
        .then(e => e.text())
        .then(raw => {
            const dom_parser = new DOMParser()
            const dom = dom_parser.parseFromString(raw, 'text/html')
            const scripts = Array.from(dom.querySelectorAll('script'))
            return { 'campaign': JSON.parse(atob(scripts.filter(x => x.innerHTML.indexOf('el: \'#campaignSettings\'') > -1)[0].innerHTML.match(/parse\(\"([^"]+)\"\)/)[1])) }
        })
        .catch(e => {
            return get_campaign_data()
        })
}

function get_donation_data(limit = null, exclusiveMaxCreatedAt = null) {
    return fetch(activities_uri, {
        'headers': {
          'accept': 'application/json, text/plain, */*',
          'content-type': 'application/json;charset=UTF-8',
        },
        'body': JSON.stringify({
            exclusiveMaxCreatedAt,
            limit
        }),
        'method': 'POST',
      })
      .then(e => e.json())
      .catch(e => get_donation_data(limit, exclusiveMaxCreatedAt))
}

function skip() {
    clearTimeout(timeout)
    dom_donation_alert.classList.toggle('pulse', false)
    dom_donation_alert.classList.toggle('hidden', true)
    triggering = false
    trigger()
}

function trigger() {
    if(triggering || trigger_queue.length == 0) {
      if(!updating && Date.now() - last_update > 5000) {
        clearTimeout(timeout)
        update()
      } else timeout = setTimeout(trigger, 1000)
      return
    }
  
    triggering = true
    const entry = trigger_queue.shift()
    const {amountCents, comment, createdAt, currency, donorIsAnonymous, donorProfilePhotoUrl, donorUserId, donorName, donorUserUrl} = entry

    dom_donation_alert_name.textContent = donorIsAnonymous ? 'Anonymous' : donorName
    dom_donation_alert_amount_prefix.textContent = ' has donated '
    
    const amount = amountCents / 100
    const has_decimal = Math.round(amount) != amount

    dom_donation_alert_amount.textContent = `${has_decimal ? amount.toFixed(2) : amount} ${currency}`
    dom_donation_alert_msg.textContent = comment
    
    if(audio_context.state == 'running') {
        donation_alert_sfx.volume = 0.2
        donation_alert_sfx.pause()
        donation_alert_sfx.currentTime = 0
        donation_alert_sfx.play()
    }
  
    const new_node = dom_donation_alert.cloneNode()
    dom_donation_alert.parentNode.replaceChild(new_node, dom_donation_alert)
    dom_donation_alert = new_node

    const possible_images = ['panda', 'gasp', 'jam', 'bunny', 'hearts']
    const random_image = Math.floor(Math.random() * possible_images.length)
    possible_images.forEach((x, i) => {
        dom_donation_image.classList.toggle(x, i == random_image)
    })
    dom_donation_alert.appendChild(dom_donation_image)
    dom_donation_alert.appendChild(dom_donation_alert_name)
    dom_donation_alert.appendChild(dom_donation_alert_amount_prefix)
    dom_donation_alert.appendChild(dom_donation_alert_amount)
    if(comment.length > 0) {
        dom_donation_alert.appendChild(dom_donation_alert_msg)
        const msg = new SpeechSynthesisUtterance();
        msg.text = comment;
        window.speechSynthesis.speak(msg);
    }
  
    dom_donation_alert.classList.toggle('pulse', true)
    dom_donation_alert.classList.toggle('hidden', false)
    dom_donation_alert.onanimationend = skip
  }