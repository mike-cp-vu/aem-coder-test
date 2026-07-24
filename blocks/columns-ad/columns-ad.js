export default function decorate(block) {
  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-ad-${cols.length}-cols`);

  // setup image columns
  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      const pic = col.querySelector('picture');
      if (pic) {
        const picWrapper = pic.closest('div');
        if (picWrapper && picWrapper.children.length === 1) {
          // picture is only content in column
          picWrapper.classList.add('columns-ad-img-col');
        }
      } else {
        // text column: the first paragraph following the heading acts as a
        // bold lead/sub-heading, but only when body paragraphs follow it.
        const heading = col.querySelector('h1, h2, h3, h4, h5, h6');
        const paragraphs = [...col.querySelectorAll(':scope > p')];
        if (heading && paragraphs.length > 1) {
          paragraphs[0].classList.add('columns-ad-lead');
        }
      }
    });
  });
}
