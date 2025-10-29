const shikiTransformMetadata = {
  pre(hast) {
    // get stuff out of this.options.meta?.__raw;
    // for now, let's start with just title="abc" or title='abc' or title=abc
    const raw = this.options.meta?.__raw || '';
    const titleMatch = raw.match(/title=(?:"([^"]+)"|'([^']+)'|([^\s"']+))/);
    if (titleMatch) {
      hast.properties.title = titleMatch[1] || titleMatch[2] || titleMatch[3];
    }
  },
};
export default shikiTransformMetadata;
