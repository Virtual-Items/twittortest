const STATIC_CACHE_NAME = 'static-v2'
const DYNAMIC_CACHE_NAME = 'dynamic-v1'
const INMUTABLE_CACHE_NAME = 'inmutable-v1'

const STATIC_CACHE = [
	// '/',
	'index.html',
	'css/style.css',
	'img/favicon.ico',
	'js/app.js'
]

const DYNAMIC_CACHE = [
	'img/avatars/spiderman.jpg',
	'img/avatars/ironman.jpg',
	'img/avatars/wolverine.jpg',
	'img/avatars/thor.jpg',
	'img/avatars/hulk.jpg',
]

const INMUTABLE_CACHE = [
	'https://fonts.googleapis.com/css?family=Quicksand:300,400',
	'https://fonts.googleapis.com/css?family=Lato:400,300',
	'https://use.fontawesome.com/releases/v5.3.1/css/all.css',
	'css/animate.css',
	'js/libs/jquery.js'
]

const updateNetworkCache = async (cacheName, req, res) => {
	return new Promise(async (resolve, reject) => {
		if (res.ok) {
			const cache = await caches.open(cacheName)
			await cache.put(req, res.clone())
			resolve(res.clone())
		} else {
			resolve(res)
		}
	})
}

const handleInstallSW = async e => {
	try {
		const staticProm = caches.open(STATIC_CACHE_NAME).then(cache => {
			cache.addAll(STATIC_CACHE)
		})

		const dynamicProm = caches.open(DYNAMIC_CACHE_NAME).then(cache => {
			cache.addAll(DYNAMIC_CACHE)
		})

		const inmutableProm = caches.open(INMUTABLE_CACHE_NAME).then(cache => {
			cache.addAll(INMUTABLE_CACHE)
		})

		e.waitUntil( Promise.all([staticProm,dynamicProm,inmutableProm]) )

	} catch {
		alert('install error!')
	}
}

const handleActivateSW = async e => {
	const response = caches.keys().then(keys => {
		keys.forEach(key => {
			if (key.includes('static') && key !== STATIC_CACHE_NAME) {
				return caches.delete(key)
			}

			if (  key.includes('dynamic') && key !== DYNAMIC_CACHE_NAME ) {
                return caches.delete(key);
            }
		})
	})

	e.waitUntil(response)
}

const handleFetchSW = e => {
	e.respondWith(new Promise( async (resolve, reject) => {
		let resource = await caches.match(e.request)

		if (!resource) {
			const httpReq = await e.request
			const httpRes = await fetch(httpReq)
			const cacheName = await DYNAMIC_CACHE_NAME
			resource = await updateNetworkCache(cacheName, httpReq, httpRes)
		}

		resolve(resource)

	}))
}

self.addEventListener('install', handleInstallSW)
self.addEventListener('activate', handleActivateSW)
self.addEventListener('fetch', handleFetchSW)
