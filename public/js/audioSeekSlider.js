// TODO:
// 1. Cursor still having trouble lining up at the beginning
//      Might be a margin/padding issue.

const spoon = document.getElementById("seekSlider");
const wrapper = document.getElementById("wrap");
const dongle = document.getElementById("rangeV");
const songLength = document.getElementById("duration");
const timeElapsed = document.getElementById("timeElapsed");

class SliderDAO {
  // Sets the duration for the slider
  static setMax(duration) {
    spoon.setAttribute("max", duration);
  }

  // Calculate Tooltip position above the slider
  static setBubbler(slider, range) {
    const rangePercent = Number(
      ((slider.value - slider.min) * 100) / (slider.max - slider.min)
    );
    wrapper.style.width = document.getElementById("albumart").clientWidth;
    spoon.style.width = wrapper.clientWidth - 100;

    const sliderWidth = spoon.clientWidth;
    const wrapperWidth = wrapper.clientWidth;

    const sliderStartPixel = (wrapperWidth - sliderWidth) / 2;

    const multiplier = sliderStartPixel / 50;

    const newPosition = sliderStartPixel - (rangePercent + 1) * multiplier;

    range.innerHTML = `<span>${WebPlaybackDAO.displayTime(
      slider.value
    )}</span>`;

    range.style.left = `calc(${rangePercent}% + (${newPosition}px))`;

    slider.style.backgroundSize = `${rangePercent}% 100%`;
  }

  static setTime(id, time) {
    const e = document.getElementById(id);
    e.innerHTML = time;
  }

  static getPosition() {
    return spoon.value;
  }
}
