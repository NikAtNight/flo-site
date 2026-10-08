// The app was renamed twice: LocalFlow, then Walkie, now Flo. The old
// localflow.talix.app and walkie.talix.app domains both run this Worker and
// 301 to flo.talix.app, keeping the path and query, so old links still work.
export default {
  fetch(request) {
    const url = new URL(request.url);
    url.hostname = 'flo.talix.app';
    return Response.redirect(url.toString(), 301);
  },
};
