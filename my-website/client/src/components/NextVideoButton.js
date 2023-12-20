import videojs from 'video.js';

const VjsButton = videojs.getComponent('Button');

class NextVideoButton extends VjsButton {
  constructor(player, options) {
    super(player, options);
    this.addClass('vjs-next-video-button'); // Add custom class
    this.controlText("Next Video");
  }

  handleClick() {
    this.player().trigger('nextVideo');
  }
}

videojs.registerComponent('NextVideoButton', NextVideoButton);
export default NextVideoButton;
