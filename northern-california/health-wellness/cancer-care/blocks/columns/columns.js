export default function decorate(block) {
  const row = block.querySelector('div');
  const names = ['zero', 'one', 'two', 'three', 'four', 'five'];
  block.classList.add(`columns-${names[row.children.length]}`);
  block.querySelectorAll('a[href^="https://kp.qumucloud.com/"]').forEach((a) => {
    const videoURL = a.href;
    a.href = '#';
    a.className = 'columns-video';
    const play = document.createElement('div');
    play.className = 'columns-video-play';
    play.innerHTML = '<span></span>';
    a.append(play);
    a.addEventListener('click', () => {
      const modal = document.createElement('div');
      modal.className = 'columns-video-modal';
      modal.innerHTML = `<span class="columns-video-modal-close"></span><iframe src="${videoURL}"></iframe>`;
      const close = modal.querySelector('.columns-video-modal-close');
      close.addEventListener('click', () => {
        modal.remove();
      });
      block.append(modal);
    });
  });
}
