// localflow.talix.app moved to walkie.talix.app when the app was renamed.
// Keep old links (portfolio, posts, release notes) working.
export default {
  fetch(request) {
    const url = new URL(request.url);
    url.hostname = 'walkie.talix.app';
    return Response.redirect(url.toString(), 301);
  },
};
