const main = () => {
  app();
};

const app = () => {
  let app = {
      media: appMedia(),
    },
    imageGallery = imageGalleryCtrl(app),
    visualizer = imageVisualizerCtrl(app),
    $container = document.getElementById("main"),
    currentView = "gallery",
    listenerFunts = {
      click: [],
      media: [],
      view: [],
    };

  const router = (...params) => {
    $container.innerHTML = "";
    exeNegociator({
      visualizer() {
        visualizer.render($container, ...params);
      },
      gallery() {
        imageGallery.render($container, ...params);
      },
    });
  };

  const exeNegociator = (obj) => {
    try {
      obj[currentView]();
    } catch {}
  };

  app.onClick = (funct) => {
    document.addEventListener("click", funct);
    listenerFunts.click.push(funct);
  };

  app.offClick = (funct) => {
    document.removeEventListener("click", funct);
    listenerFunts.click = listenerFunts.click.filter((f) => f !== funct);
  };

  app.onMediaChange = (funct) => {
    app.media.large.addEventListener("change", funct);
    app.media.middle.addEventListener("change", funct);
    listenerFunts.media.push(funct);
  };

  app.offMediaChange = (funct) => {
    listenerFunts.media.forEach((f) => {
      app.media.large.removeEventListener("change", funct);
      app.media.middle.removeEventListener("change", funct);
    });
    listenerFunts.media = listenerFunts.media.filter((f) => f !== funct);
  };

  app.changeView = (view, ...params) => {
    currentView = view;

    listenerFunts.click.forEach((funct) =>
      document.removeEventListener("click", funct)
    );
    listenerFunts.click.length = 0;
    listenerFunts.media.forEach((funct) => {
      app.media.large.removeEventListener("change", funct);
      app.media.middle.removeEventListener("change", funct);
    });
    listenerFunts.media.length = 0;
    router(...params);
  };

  router();
};

const imageGalleryCtrl = (app) => {
  let menu = menuCtrl(app),
    currentClass = "";

  const render = ($container) => {
    let $gallery = document
      .getElementById("image-gallery-template")
      .content.cloneNode(true);

    $container.appendChild($gallery);
    adjustGrid();
    menu.init();
    btnScroll();
    app.onMediaChange(adjustGrid);
    app.onClick(handleClick);
  };

  const handleClick = (e) => {
    let p = e.target.parentNode;

    if (e.target.tagName === "IMG" && p.dataset.sect) {
      let images = imagesGallery(),
        imageIndex = images.findIndex((img) => img.node === e.target);

      app.changeView("visualizer", images, imageIndex);
    }
  };

  const adjustGrid = () => {
    let $containers = document.querySelectorAll(".js-img-container"),
      nextClass = "";

    if (app.media.large.matches) nextClass = "grid-3";
    else if (app.media.middle.matches) nextClass = "grid-2";
    else nextClass = "grid-1";

    $containers.forEach(($container) => {
      if (currentClass !== "") $container.classList.remove(currentClass);
      $container.classList.add(nextClass);
    });
    currentClass = nextClass;
  };

  return { render };
};

const menuCtrl = (app) => {
  let $menu = null,
    $btnClose = null;

  const init = () => {
    $menu = document.getElementById("nav-menu");
    handleMedia();
    app.onMediaChange(handleMedia);
  };

  const showMenu = () => $menu.classList.add("nav-menu--show");

  const hiddeMenu = () => $menu.classList.remove("nav-menu--show");

  const handleClick = (e) => {
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
    $btnClose = buttonElement({
      onClick: hiddeMenu,
      iconPath: "icons/xmark-solid.svg",
      classes: ["btn-close"],
    });
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

  const handleMedia = () => {
    if (app.media.large.matches) {
      app.offClick(handleClick);
      desktop();
    } else {
      app.onClick(handleClick);
      mobile();
    }
  };

  return { init };
};

const btnScroll = () => {
  const SCROLL_TOP = 1000;

  let $btn = document.getElementById("btn-scroll-top");

  const handleScroll = () => {
    if (window.scrollY > SCROLL_TOP) $btn.classList.remove("hidden");
    else $btn.classList.add("hidden");
  };

  const handleClick = () => {
    window.scroll(0, 0);
  };

  window.addEventListener("scroll", handleScroll);
  $btn.addEventListener("click", handleClick);
  handleScroll();
};

const imageVisualizerCtrl = (app) => {
  const MIN_X_SLIDE_TO_CHANGE = 150;

  let _images,
    _imageIndex = null,
    _imageCtrl = createImageCtrl(),
    _$visualizer = null,
    _$visualizerImageContainer = null,
    _$tinyImages = null,
    _firstTouch = null,
    _prevTouch = null,
    _touchTimestamp = Date.now(),
    _imageMoving = false,
    changeImageBtns = nextBackImageBtns({
      app,
      onNext() {
        nextImage();
      },
      onPrevius() {
        previusImage();
      },
    }),
    zoomBtns = optionsButton({
      app,
      onMinusZoom() {
        handleMinusZoom();
      },
      onPlusZoom() {
        handlePlusZoom();
      },
      onRestore() {
        handleRestore();
      },
    }),
    $btnMobileZoomPlus = buttonElement({
      onClick() {
        _imageCtrl.plusZoom();
        if (_imageCtrl.isMaxZoom()) $btnMobileZoomPlus.classList.add("desable");
        $btnMobileZoomMinus.classList.remove("desable");
      },
      iconPath: "icons/magnifying-glass-plus-solid.svg",
      classes: ["mb-btn-zoom-plus"],
    }),
    $btnMobileZoomMinus = buttonElement({
      onClick() {
        _imageCtrl.minusZoom();
        if (_imageCtrl.isMinZoom())
          $btnMobileZoomMinus.classList.add("desable");
        $btnMobileZoomPlus.classList.remove("desable");
      },
      iconPath: "icons/magnifying-glass-minus-solid.svg",
      classes: ["mb-btn-zoom-minus"],
    });

  const render = ($container, images, imageIndex) => {
    _$visualizer = document
      .getElementById("visulizer-template")
      .content.firstElementChild.cloneNode(true);

    $container.appendChild(_$visualizer);
    $container.appendChild($btnMobileZoomMinus);
    $container.appendChild($btnMobileZoomPlus);
    _images = images;
    _imageIndex = imageIndex;
    _$tinyImages = document.getElementById("tiny-images");
    _$visualizerImageContainer = document.getElementById(
      "visualizer-image-container"
    );
    changeImageBtns.render({ $container: _$visualizerImageContainer });
    zoomBtns.render({
      $container: document.getElementById("visualizer-buttons-container"),
    });
    renderTinyImages();
    renderImage();
    configButtons();
    handleMediaChange();
    _$visualizerImageContainer.addEventListener("touchmove", handleTouchMove);
    _$visualizerImageContainer.addEventListener("touchend", handleTouchEnd);
    _$visualizerImageContainer.addEventListener("touchstart", handleTouchStart);
    app.onClick(handleClickClose);
    app.onClick(handleClickTinyImage);
    app.onMediaChange(handleMediaChange);
    _$visualizerImageContainer.addEventListener("mousedown", handleMouseDown);
    _$visualizerImageContainer.addEventListener("mousemove", handleMouseMove);
    _$visualizerImageContainer.addEventListener("mouseup", handleMouseUp);
    _$visualizerImageContainer.addEventListener("mouseleave", handlemouseLeave);
    window.scroll(0, 0);
  };

  const renderImage = () => {
    _imageCtrl.removeImage();
    _imageCtrl.setImage(_images[_imageIndex].node.cloneNode());
    _imageCtrl.insertImage(_$visualizerImageContainer);

    zoomBtns.enableMinusBtn();
    zoomBtns.enablePlusBtn();
  };

  const renderTinyImages = () => {
    let $frag = document.createDocumentFragment();

    _images.forEach((image) => {
      image.node.classList.add("visualizer__tiny-image", "js-tiny-image");
      $frag.appendChild(image.node);
    });
    _$tinyImages.appendChild($frag);
  };

  const handleClickClose = (e) => {
    if (e.target.id === "close-visualizer-btn") closeVisualizer();
  };

  const nextImage = () => {
    if (_imageIndex < _images.length - 1) {
      _imageIndex++;
      renderImage();
      configButtons();
    }
  };

  const previusImage = () => {
    if (_imageIndex > 0) {
      _imageIndex--;
      renderImage();
      configButtons();
    }
  };

  const handleClickTinyImage = (e) => {
    if (e.target.matches(".js-tiny-image")) {
      let index = _images.findIndex((img) => img.node === e.target);

      if (index !== _imageIndex) {
        _imageIndex = index;
        renderImage();
        configButtons();
      }
    }
  };

  const handleMediaChange = () => {
    if (app.media.middle.matches) {
      changeImageBtns.showButtons();
      zoomBtns.showButtons();

      $btnMobileZoomMinus.classList.add("hidden");
      $btnMobileZoomPlus.classList.add("hidden");
    } else {
      changeImageBtns.hiddenButtons();
      zoomBtns.hiddenButtons();

      $btnMobileZoomMinus.classList.remove("hidden");
      $btnMobileZoomPlus.classList.remove("hidden");
    }
  };

  const handleTouchStart = (e) => {
    let now = Date.now();

    _firstTouch = e.touches[0];

    if (now - _touchTimestamp <= 500) _imageCtrl.reset();
    _touchTimestamp = Date.now();
  };

  const handleTouchMove = (e) => {
    let currentTouch = e.touches[0];

    if (_prevTouch) {
      let slideX = currentTouch.pageX - _prevTouch.pageX,
        slideY = currentTouch.pageY - _prevTouch.pageY;

      _imageCtrl.offset(slideX, slideY);
    }
    _prevTouch = currentTouch;
    e.preventDefault();
  };

  const handleTouchEnd = () => {
    if (_prevTouch && _firstTouch) {
      let sc = _imageCtrl.sidesConstraint(),
        slideX = _prevTouch.pageX - _firstTouch.pageX;

      if (sc.left && slideX >= MIN_X_SLIDE_TO_CHANGE) previusImage();
      else if (sc.right && slideX <= -MIN_X_SLIDE_TO_CHANGE) nextImage();
    }
    _prevTouch = null;
    _firstTouch = null;
  };

  const handleMinusZoom = () => {
    _imageCtrl.minusZoom();
    if (_imageCtrl.isMinZoom()) zoomBtns.desableMinusBtn();
    if (!_imageCtrl.isMoveable)
      _$visualizerImageContainer.classList.remove(
        "visualizer__image--allow-move"
      );
    zoomBtns.enablePlusBtn();
  };

  const handlePlusZoom = () => {
    _imageCtrl.plusZoom();
    if (_imageCtrl.isMaxZoom()) zoomBtns.desablePlusBtn();
    if (_imageCtrl.isMoveable)
      _$visualizerImageContainer.classList.add("visualizer__image--allow-move");
    zoomBtns.enableMinusBtn();
  };

  const handleRestore = () => {
    _imageCtrl.reset();
    _$visualizerImageContainer.classList.remove(
      "visualizer__image--allow-move"
    );
    zoomBtns.enableMinusBtn();
    zoomBtns.enablePlusBtn();
  };

  const handleMouseDown = (e) => {
    _imageMoving = true;
    if (_imageCtrl.isMoveable)
      _$visualizerImageContainer.classList.add("visualizer__image--moving");
  };

  const handleMouseMove = (e) => {
    if (_imageMoving) _imageCtrl.offset(e.movementX, e.movementY);
  };

  const handleMouseUp = (e) => {
    _imageMoving = false;
    _$visualizerImageContainer.classList.remove("visualizer__image--moving");
  };

  const handlemouseLeave = () => {
    _imageMoving = false;
    _$visualizerImageContainer.classList.remove("visualizer__image--moving");
  };

  const closeVisualizer = () => {
    _images = null;
    _imageIndex = null;
    _$visualizer = null;
    _$tinyImages = null;
    app.changeView("gallery");
  };

  const configButtons = () => {
    if (_imageIndex >= _images.length - 1) changeImageBtns.desableRight();
    else changeImageBtns.enableRight();

    if (_imageIndex <= 0) changeImageBtns.desableLeft();
    else changeImageBtns.enableLeft();
  };

  return { render };
};

const imagesGallery = () => {
  let arrResult = [],
    images = document.images;

  for (let i = 0; i < images.length; i++) {
    let image = images.item(i),
      parent = image.parentElement,
      sectName = parent.dataset.sect;

    if (sectName) {
      image.classList.value = "";
      arrResult.push({
        sectName,
        node: image,
      });
    }
  }
  return arrResult;
};

const buttonElement = ({ onClick, iconPath, classes }) => {
  let $btn = document.createElement("div"),
    $icon = document.createElement("img");

  $icon.src = iconPath;
  $btn.classList.add("btn");
  if (classes) $btn.classList.add(...classes);
  $btn.appendChild($icon);
  $btn.addEventListener("click", onClick);
  return $btn;
};

const nextBackImageBtns = ({ onNext, onPrevius }) => {
  let $btnLeft = buttonElement({
      onClick(e) {
        onPrevius(e);
      },
      iconPath: "icons/arrow-left-long-solid.svg",
      classes: ["visualizer__btn-previus"],
    }),
    $btnRight = buttonElement({
      onClick(e) {
        onNext(e);
      },
      iconPath: "icons/arrow-left-long-solid.svg",
      classes: ["visualizer__btn-next"],
    });

  const render = ({ $container }) => {
    $container.appendChild($btnLeft);
    $container.appendChild($btnRight);
  };

  const enableRight = () => {
    $btnRight.classList.remove("desable");
  };

  const desableRight = () => {
    $btnRight.classList.add("desable");
  };

  const enableLeft = () => {
    $btnLeft.classList.remove("desable");
  };

  const desableLeft = () => {
    $btnLeft.classList.add("desable");
  };

  const showButtons = () => {
    $btnLeft.classList.remove("hidden");
    $btnRight.classList.remove("hidden");
  };

  const hiddenButtons = () => {
    $btnLeft.classList.add("hidden");
    $btnRight.classList.add("hidden");
  };

  return {
    render,
    enableLeft,
    desableLeft,
    enableRight,
    desableRight,
    showButtons,
    hiddenButtons,
  };
};

const createImageCtrl = () => {
  const MAX_ZOOM = 19,
    MIN_ZOOM = 1,
    INTERVAL_ZOOM = 1;

  return {
    _$image: null,
    _zoom: 10,
    _offsetX: 0,
    _offsetY: 0,
    get isMoveable() {
      return this._zoom > 10;
    },
    setImage($image) {
      this._$image = $image;
      this._$image.classList.value = "";
      this._$image.classList.add("visualizer__image");
      this._$image.draggable = false;
      this.reset();
    },
    insertImage($container) {
      $container.appendChild(this._$image);
    },
    removeImage() {
      if (this._$image) {
        this._$image.remove();
        this._$image = null;
      }
    },
    isMaxZoom() {
      return this._zoom === MAX_ZOOM;
    },
    isMinZoom() {
      return this._zoom === MIN_ZOOM;
    },
    plusZoom() {
      this._zoom = Math.min(this._zoom + INTERVAL_ZOOM, MAX_ZOOM);
      this._transformImage();
    },
    minusZoom() {
      this._zoom = Math.max(this._zoom - INTERVAL_ZOOM, MIN_ZOOM);
      if (this._zoom <= 10) {
        this._offsetX = 0;
        this._offsetY = 0;
      }
      this._transformImage();
    },
    offset(x, y) {
      let sc = this.sidesConstraint();

      if ((x > 0 && !sc.right) || (x < 0 && !sc.left))
        this._offsetX += (x * 10) / this._zoom;

      if ((y > 0 && !sc.top) || (y < 0 && !sc.bottom))
        this._offsetY += (y * 10) / this._zoom;

      this._transformImage();
    },
    sidesConstraint() {
      if (this.isMoveable) {
        let imgBound = this._$image.getBoundingClientRect();

        return {
          top: imgBound.y > imgBound.height / 2,
          bottom: imgBound.y + imgBound.height / 2 < 0,
          right: imgBound.x > imgBound.width / 2,
          left: imgBound.x + imgBound.width / 2 < 0,
        };
      } else {
        return {
          top: true,
          bottom: true,
          right: true,
          left: true,
        };
      }
    },
    reset() {
      this._zoom = 10;
      this._offsetX = 0;
      this._offsetY = 0;
      this._transformImage();
    },
    _transformImage() {
      this._$image.style.transform = `scale(${this._zoom / 10}) translate(${
        this._offsetX
      }px,${this._offsetY}px)`;
    },
  };
};

const optionsButton = ({ app, onPlusZoom, onMinusZoom, onRestore }) => {
  let _$buttons = null,
    _$btnPlusZoom = null,
    _$btnMinusZoom = null,
    _$btnRestore = null;

  const render = ({ $container }) => {
    _$buttons = document
      .getElementById("visualizer-buttons-template")
      .content.firstElementChild.cloneNode(true);

    $container.prepend(_$buttons);
    _$btnMinusZoom = document.getElementById("btn-minus-zoom");
    _$btnPlusZoom = document.getElementById("btn-plus-zoom");
    _$btnRestore = document.getElementById("btn-restore");
    app.onClick(handleClick);
  };

  const handleClick = (e) => {
    let target = e.target;

    if (target === _$btnRestore) onRestore(e);
    else if (target === _$btnMinusZoom) onMinusZoom(e);
    else if (target === _$btnPlusZoom) onPlusZoom(e);
  };

  const showButtons = () => {
    _$buttons.classList.remove("hidden");
  };

  const hiddenButtons = () => {
    _$buttons.classList.add("hidden");
  };

  const enablePlusBtn = () => {
    _$btnPlusZoom.classList.remove("desable");
  };

  const desablePlusBtn = () => {
    _$btnPlusZoom.classList.add("desable");
  };

  const enableMinusBtn = () => {
    _$btnMinusZoom.classList.remove("desable");
  };

  const desableMinusBtn = () => {
    _$btnMinusZoom.classList.add("desable");
  };

  return {
    render,
    showButtons,
    hiddenButtons,
    enableMinusBtn,
    enablePlusBtn,
    desableMinusBtn,
    desablePlusBtn,
  };
};

const appMedia = () => ({
  large: matchMedia("(min-width: 1024px)"),
  middle: matchMedia("(min-width: 480px)"),
});

document.addEventListener("DOMContentLoaded", main);
