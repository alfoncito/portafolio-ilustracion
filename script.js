const main = () => {
  menuCtrl();
  gridImages();
  btnScroll();
  imageVisualizer();
};

const app = () => {
  let largeMedia = matchMedia("(min-width: 1024px)"),
    middleMedia = matchMedia("(min-width: 480px)"),
    menu,
    visualizer,
    scrollButton;

  const handleChangeMedia = () => {
    if (largeMedia.matches) {
    } else if (middleMedia.matches) {
    } else {
    }
  };
};

const menuCtrl = () => {
  let media = matchMedia("(min-width: 1024px)"),
    $menu = document.getElementById("nav-menu"),
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

  const configMenu = (media) => {
    if (media.matches) {
      document.removeEventListener("click", handleClickMenu);
      desktop();
    } else {
      document.addEventListener("click", handleClickMenu);
      mobile();
    }
  };

  media.addEventListener("change", (e) => configMenu(e));

  configMenu(media);
};

const gridImages = () => {
  let media1 = matchMedia("(min-width: 480px)"),
    media2 = matchMedia("(min-width: 1024px)"),
    currentClass = "";

  const configGrid = () => {
    let $containers = document.querySelectorAll(".js-img-container"),
      nextClass = "";

    if (media2.matches) nextClass = "grid-3";
    else if (media1.matches) nextClass = "grid-2";
    else nextClass = "grid-1";

    $containers.forEach(($container) => {
      if (currentClass !== "") $container.classList.remove(currentClass);
      $container.classList.add(nextClass);
    });
    currentClass = nextClass;
  };

  media1.addEventListener("change", configGrid);
  media2.addEventListener("change", configGrid);
  configGrid();
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

const imageVisualizer = () => {
  document.addEventListener("click", (e) => {
    if (e.target.tagName === "IMG") {
      let $template = document
        .getElementById("visulizer-template")
        .content.firstElementChild.cloneNode(true);

      document.body.appendChild($template);
    }
  });
};

const imagesGallery = () => {
  let arr = [],
    images = document.images;

  for (let i = 0; i < images.length; i++) {
    let image = images.item(i),
      parent = image.parentElement,
      sectName = parent.dataset.sect;

    if (sectName) arr.push({ sectName, image });
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
