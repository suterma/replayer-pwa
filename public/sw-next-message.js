console.log('SWNEXTMESSAGE!');

self.addEventListener('fetch', (event) => {
    console.log('SWNEXTMESSAGE!FETCHED!');

    const url = new URL(event.request.url);
    // If this is an incoming POST request for the
    // registered "action" URL, respond to it.
    if (event.request.method === 'POST' && url.pathname === '/#/edit') {
        console.log('SWNEXTMESSAGE!ACTION!');

        event.respondWith(
            (async () => {
                const formData = await event.request.formData();
                debugger;
                const link = formData.get('link') || '';
                const responseUrl = await saveBookmark(link);
                return Response.redirect(responseUrl, 303);
            })(),
        );
    }
});
