const main = () => {
  app();
  btnScroll();
};

const app = () => {
  let media = {
      large: matchMedia("(min-width: 1024px)"),
      middle: matchMedia("(min-width: 480px)"),
    },
    menu = menuCtrl(),
    gridImages = gridImagesCtrl(),
    visualizer = imageVisualizerCtrl();

  const handleChangeMedia = () => {
    menu.handleMedia(media);
    gridImages.handleMedia(media);
  };

  const handleClick = (e) => {
    visualizer.handleClick(e);
  };

  media.large.addEventListener("change", handleChangeMedia);
  media.middle.addEventListener("change", handleChangeMedia);
  document.addEventListener("click", handleClick);
  handleChangeMedia();
};

const menuCtrl = () => {
  let $menu = document.getElementById("nav-menu"),
    $btnClose = null;

  const showMenu = () => $menu.classList.add("nav-menu--show");

  const hiddeMenu = () => $menu.classList.remove("nav-menu--show");

  const handleClickMenu = (e) => {
    if (e.target.matches("#btn-menu") || e.target.matches("#btn-menu *")) {
      showMenu();
    } else if (
      !(e.target.matches("#nav-menu") || e.target.matches("#nav-menu *")) ||
      e.target.tagName.toLowerCase() === "a"
    ) {
      hiddeMenu();
    }
  };

  const mobile = () => {
    $menu.classList.remove("nav-menu--desktop");
    $menu.classList.add("nav-menu--mobile");
    $menu.classList.add("flex-center");
    $btnClose = closeButtonElement({ onClick: hiddeMenu });
    $menu.appendChild($btnClose);
  };

  const desktop = () => {
    $menu.classList.remove("nav-menu--mobile");
    $menu.classList.add("nav-menu--desktop");
    $menu.classList.remove("nav-menu--show");
    $menu.classList.remove("flex-center");
    $btnClose?.remove();
    $btnClose = null;
  };

  const handleMedia = (media) => {
    if (media.large.matches) {
      document.removeEventListener("click", handleClickMenu);
      desktop();
    } else {
      document.addEventListener("click", handleClickMenu);
      mobile();
    }
  };

  return {
    handleMedia,
  };
};

const gridImagesCtrl = () => {
  let $containers = document.querySelectorAll(".js-img-container"),
    currentClass = "";

  const handleMedia = (media) => {
    let nextClass = "";

    if (media.large.matches) nextClass = "grid-3";
    else if (media.middle.matches) nextClass = "grid-2";
    else nextClass = "grid-1";

    $containers.forEach(($container) => {
      if (currentClass !== "") $container.classList.remove(currentClass);
      $container.classList.add(nextClass);
    });
    currentClass = nextClass;
  };

  return { handleMedia };
};

const btnScroll = () => {
  let $btn = document.getElementById("btn-scroll-top");

  window.addEventListener("scroll", (e) => {
    if (window.scrollY > 1000) $btn.classList.remove("hidden");
    else $btn.classList.add("hidden");
  });

  $btn.addEventListener("click", () => {
    window.scroll(0, 0);
  });
};

const imageVisualizerCtrl = () => {
  const LISTEN = 0,
    OPEN = 1;

  let images,
    state = LISTEN,
    imageIndex = null,
    $visualizer = null,
    $tinyImages = null;

  const renderVisualizer = (img) => {
    $visualizer = document
      .getElementById("visulizer-template")
      .content.firstElementChild.cloneNode(true);

    images = imagesGallery();
    imageIndex = images.findIndex((image) => image.node === img);
    document.body.appendChild($visualizer);
    $tinyImages = document.getElementById("tiny-images");
    renderTinyImages();
  };

  const renderTinyImages = () => {
    let $frag = document.createDocumentFragment();

    images.forEach((image) => {
      $frag.appendChild(image.node);
    });
    $tinyImages.appendChild($frag);
  };

  const closeVisualizer = () => {
    images = null;
    imageIndex = null;
    $visualizer.remove();
    $visualizer = null;
    $tinyImages = null;
  };

  const handleClick = (e) => {
    if (state === LISTEN) {
      if (e.target.tagName === "IMG") {
        renderVisualizer(e.target);
        state = OPEN;
      }
    } else if (state === OPEN) {
      if (e.target.id === "close-visualizer-btn") {
        closeVisualizer();
        state = LISTEN;
      }
    } else {
      throw new Error(`Estado "${state}" del visualizador invalido`);
    }
  };

  return { handleClick };
};

const imagesGallery = () => {
  let arr = [],
    images = document.images;

  for (let i = 0; i < images.length; i++) {
    let image = images.item(i),
      parent = image.parentElement,
      sectName = parent.dataset.sect;

    if (sectName) {
      image = image.cloneNode();
      image.classList.add("visualizer__tiny-image");
      arr.push({
        sectName,
        node: image,
      });
    }
  }
  return arr;
};

const closeButtonElement = ({ onClick }) => {
  let $btn = document.createElement("div"),
    $icon = document.createElement("img");

  $icon.src = "icons/xmark-solid.svg";
  $btn.classList.add("btn-close");
  $btn.appendChild($icon);
  $btn.addEventListener("click", onClick);
  return $btn;
};

document.addEventListener("DOMContentLoaded", main);
