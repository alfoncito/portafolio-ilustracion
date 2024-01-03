const main = () => {
  app();
};

const app = () => {
  let media = appMedia(),
    app = {
      media,
      observer: createObserver(media),
    },
    imageGallery = imageGalleryCtrl(app),
    visualizer = imageVisualizerCtrl(app),
    $container = document.getElementById("main"),
    currentView = "gallery";

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
    } catch (err) {
      console.error(err);
    }
  };

  app.changeView = (view, ...params) => {
    currentView = view;

    app.observer.triggerViewChange();
    app.observer.clear();
    router(...params);
  };

  router();
};

const imageGalleryCtrl = (app) => {
  let menu = menuCtrl(app),
    scrollTop = null,
    sectTitlesObserver = null,
    imagesObserver = null,
    navLinks = null;

  const render = ($container) => {
    let $gallery = document
      .getElementById("image-gallery-template")
      .content.cloneNode(true);

    $container.appendChild($gallery);
    adjustScroll();
    menu.init();
    btnScroll(app);
    app.observer.onClick(handleClick);
    app.observer.onViewChange(handleViewChange);
    observeSectTitle();
    observeImages();
  };

  const handleClick = (e) => {
    let p = e.target.parentNode;

    if (e.target.tagName === "IMG" && p.dataset.sect) {
      let images = imagesGallery(),
        imageIndex = images.findIndex((img) => img.node === e.target);

      app.changeView("visualizer", images, imageIndex);
    }
  };

  const handleViewChange = () => {
    scrollTop = window.scrollY;
    sectTitlesObserver.disconnect();
    imagesObserver.disconnect();
  };

  const adjustScroll = () => {
    if (scrollTop) {
      setTimeout(() => {
        window.scroll(0, scrollTop);
      }, 200);
    }
  };

  const observeSectTitle = () => {
    let sectsTitles = document.querySelectorAll(".js-section-title");

    navLinks = createNavLinks();
    sectTitlesObserver = new IntersectionObserver(handleSectImageObserve, {
      root: null,
      threshold: 1,
      rootMargin: "0px 0px -60% 0px",
    });
    sectsTitles.forEach((sectTitle) => sectTitlesObserver.observe(sectTitle));
  };

  const createNavLinks = () => {
    let links = document.querySelectorAll(".js-menu-link"),
      sectsTitles = document.querySelectorAll(".js-section-title"),
      navLinks = [];

    for (let i = 0; i < links.length; i++) {
      navLinks[i] = {
        link: links[i],
        sectTitle: sectsTitles[i],
      };
    }
    return navLinks;
  };

  const handleSectImageObserve = (entries) => {
    let instersectingSomething = false;

    blurAllLinks();
    entries.forEach((entrie) => {
      if (entrie.isIntersecting) {
        focusLink(entrie.target);
        instersectingSomething = true;
      }
    });

    if (!instersectingSomething) {
      let maxTop = -Infinity,
        navLinkIndex = null;

      navLinks.forEach((navLink, index) => {
        let stb = navLink.sectTitle.getBoundingClientRect();

        if (stb.top <= 0 && stb.top > maxTop) {
          maxTop = stb.top;
          navLinkIndex = index;
        }
      });

      if (navLinkIndex !== null) focusLink(navLinks[navLinkIndex].sectTitle);
    }
  };

  const focusLink = ($sectTitle) => {
    let sectTitleIndex = navLinks.findIndex(
      (nl) => nl.sectTitle === $sectTitle
    );

    navLinks[sectTitleIndex].link.classList.add("link--selected");
  };

  const blurAllLinks = () => {
    navLinks.forEach((nl) => nl.link.classList.remove("link--selected"));
  };

  const observeImages = () => {
    let images = document.querySelectorAll(".js-img");

    imagesObserver = new IntersectionObserver(handleImageObserve, {
      root: null,
      rootMargin: "0px",
      threshold: 0.5,
    });

    images.forEach(($img) => {
      imagesObserver.observe($img);
    });
  };

  const handleImageObserve = (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add("slice-fade-in");
    });
  };

  return { render };
};

const menuCtrl = (app) => {
  let $btnMenu = null,
    $navMenu = null,
    $btnClose = null;

  const init = () => {
    $navMenu = document.getElementById("nav-menu");
    $btnMenu = document.getElementById("btn-menu");
    handleMedia();
    app.observer.onMediaChange(handleMedia);
  };

  const showMenu = () => $navMenu.classList.add("nav-menu--show");

  const hiddeMenu = () => $navMenu.classList.remove("nav-menu--show");

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
    $navMenu.classList.remove("nav-menu--desktop");
    $navMenu.classList.add("nav-menu--mobile");
    $navMenu.classList.add("flex-center");
    $btnClose = buttonElement({
      onClick: hiddeMenu,
      iconPath: "icons/close.svg",
      classes: ["btn", "btn-icon", "btn-close"],
    });
    $navMenu.appendChild($btnClose);
    $btnMenu.classList.remove("hidden");
  };

  const desktop = () => {
    $navMenu.classList.remove("nav-menu--mobile");
    $navMenu.classList.add("nav-menu--desktop");
    $navMenu.classList.remove("nav-menu--show");
    $navMenu.classList.remove("flex-center");
    $btnClose?.remove();
    $btnClose = null;
    $btnMenu.classList.add("hidden");
  };

  const handleMedia = () => {
    if (app.media.large.matches) {
      app.observer.offClick(handleClick);
      desktop();
    } else {
      app.observer.onClick(handleClick);
      mobile();
    }
  };

  return { init };
};

const btnScroll = (app) => {
  const SCROLL_TOP = 600;

  let $btn = document.getElementById("btn-scroll-top");

  const handleScroll = () => {
    if (window.scrollY > SCROLL_TOP) $btn.classList.remove("hidden");
    else $btn.classList.add("hidden");
  };

  const handleClick = () => {
    window.scroll(0, 0);
  };

  handleScroll();
  app.observer.onScroll(handleScroll);
  $btn.addEventListener("click", handleClick);
};

const imageVisualizerCtrl = (app) => {
  const MIN_X_SLIDE_TO_CHANGE = 150;

  let _images,
    _imageIndex = null,
    _imageCtrl = createImageCtrl(),
    _$title = null,
    _$visualizer = null,
    _$visualizerImageContainer = null,
    _$tinyImages = null,
    _firstTouch = null,
    _prevTouch = null,
    _touchTimestamp = Date.now(),
    _imageMoving = false,
    changeImageBtns = nextBackImageBtns({
      onNext() {
        nextImage();
      },
      onPrevius() {
        previusImage();
      },
    }),
    _zoomBtns = optionsButton({
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
    _$btnMobileZoomPlus = buttonElement({
      onClick() {
        _imageCtrl.plusZoom();
        if (_imageCtrl.isMaxZoom())
          _$btnMobileZoomPlus.classList.add("desable");
        _$btnMobileZoomMinus.classList.remove("desable");
      },
      iconPath: "icons/zoom-in.svg",
      classes: ["btn", "btn-round", "mb-btn-zoom-plus"],
    }),
    _$btnMobileZoomMinus = buttonElement({
      onClick() {
        _imageCtrl.minusZoom();
        if (_imageCtrl.isMinZoom())
          _$btnMobileZoomMinus.classList.add("desable");
        _$btnMobileZoomPlus.classList.remove("desable");
      },
      iconPath: "icons/zoom-out.svg",
      classes: ["btn", "btn-round", "mb-btn-zoom-minus", "desable"],
    });

  const render = ($container, images, imageIndex) => {
    _$visualizer = document
      .getElementById("visulizer-template")
      .content.firstElementChild.cloneNode(true);

    $container.appendChild(_$visualizer);
    $container.appendChild(_$btnMobileZoomMinus);
    $container.appendChild(_$btnMobileZoomPlus);
    _images = images;
    _imageIndex = imageIndex;
    _$tinyImages = document.getElementById("tiny-images");
    _$visualizerImageContainer = document.getElementById(
      "visualizer-image-container"
    );
    _$title = document.getElementById("visualizer-title");
    changeImageBtns.render({ $container: _$visualizerImageContainer });
    _zoomBtns.render({
      $container: document.getElementById("visualizer-buttons-container"),
    });
    renderTinyImages();
    renderImage();
    configButtons();
    handleMediaChange();
    _$visualizerImageContainer.addEventListener("touchmove", handleTouchMove);
    _$visualizerImageContainer.addEventListener("touchend", handleTouchEnd);
    _$visualizerImageContainer.addEventListener("touchstart", handleTouchStart);
    app.observer.onClick(handleClickClose);
    app.observer.onClick(handleClickTinyImage);
    app.observer.onMediaChange(handleMediaChange);
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

    _zoomBtns.enableMinusBtn();
    _zoomBtns.enablePlusBtn();
    _$title.textContent = _images[_imageIndex].sectName;
    adjustTinyImage();
    adjustZoomBtns();
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
      _zoomBtns.showButtons();

      _$btnMobileZoomMinus.classList.add("hidden");
      _$btnMobileZoomPlus.classList.add("hidden");
    } else {
      changeImageBtns.hiddenButtons();
      _zoomBtns.hiddenButtons();

      _$btnMobileZoomMinus.classList.remove("hidden");
      _$btnMobileZoomPlus.classList.remove("hidden");
    }
  };

  const handleTouchStart = (e) => {
    _firstTouch = e.touches[0];
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
    let now = Date.now();

    if (now - _touchTimestamp <= 500) handleDblTouch();

    if (_prevTouch && _firstTouch) {
      let sc = _imageCtrl.sidesConstraint(),
        slideX = _prevTouch.pageX - _firstTouch.pageX;

      if (sc.left && slideX >= MIN_X_SLIDE_TO_CHANGE) previusImage();
      else if (sc.right && slideX <= -MIN_X_SLIDE_TO_CHANGE) nextImage();
    }
    _prevTouch = null;
    _firstTouch = null;
    _touchTimestamp = Date.now();
  };

  const handleDblTouch = () => {
    _imageCtrl.reset();
    _$btnMobileZoomPlus.classList.remove("desable");
    _$btnMobileZoomMinus.classList.add("desable");
  };

  const handleMinusZoom = () => {
    _imageCtrl.minusZoom();
    if (_imageCtrl.isMinZoom()) _zoomBtns.desableMinusBtn();
    if (!_imageCtrl.isMoveable)
      _$visualizerImageContainer.classList.remove(
        "visualizer__image--allow-move"
      );
    _zoomBtns.enablePlusBtn();
  };

  const handlePlusZoom = () => {
    _imageCtrl.plusZoom();
    if (_imageCtrl.isMaxZoom()) _zoomBtns.desablePlusBtn();
    if (_imageCtrl.isMoveable)
      _$visualizerImageContainer.classList.add("visualizer__image--allow-move");
    _zoomBtns.enableMinusBtn();
  };

  const handleRestore = () => {
    _imageCtrl.reset();
    _$visualizerImageContainer.classList.remove(
      "visualizer__image--allow-move"
    );
    adjustZoomBtns();
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

  const adjustZoomBtns = () => {
    _zoomBtns.desableMinusBtn();
    _zoomBtns.enablePlusBtn();
  };

  const adjustTinyImage = () => {
    let tinyImagesContainerBound = _$tinyImages.getBoundingClientRect(),
      tinyImageBound = _images[_imageIndex].node.getBoundingClientRect(),
      scrollLeft = _$tinyImages.scrollLeft,
      scrollXCenter =
        tinyImagesContainerBound.width / 2 - tinyImageBound.width / 2,
      diffCenter = tinyImageBound.x - scrollXCenter;

    _$tinyImages.scroll(scrollLeft + diffCenter, 0);
    focusImage();
  };

  const focusImage = () => {
    _images.forEach((img) => {
      img.node.classList.remove("visualizer__tiny-image--focus");
    });
    _images[_imageIndex].node.classList.add("visualizer__tiny-image--focus");
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
      iconPath: "icons/arrow.svg",
      classes: ["btn", "visualizer__btn-previus", "flex-center"],
    }),
    $btnRight = buttonElement({
      onClick(e) {
        onNext(e);
      },
      iconPath: "icons/arrow.svg",
      classes: ["btn", "visualizer__btn-next", "flex-center"],
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
  const MAX_ZOOM = 25,
    MIN_ZOOM = 10,
    INTERVAL_ZOOM = 2;

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

      if ((y > 0 && !sc.bottom) || (y < 0 && !sc.top))
        this._offsetY += (y * 10) / this._zoom;

      this._transformImage();
    },
    sidesConstraint() {
      if (this.isMoveable) {
        let imgBound = this._$image.getBoundingClientRect(),
          windowHalfWidth = window.innerWidth / 2,
          windowHalfHeight = window.innerHeight / 2;

        return {
          top: imgBound.y + imgBound.height <= windowHalfHeight,
          right: imgBound.x >= windowHalfWidth,
          bottom: imgBound.y >= windowHalfHeight,
          left: imgBound.x + imgBound.width <= windowHalfWidth,
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
    app.observer.onClick(handleClick);
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

const createObserver = (media) => ({
  _click: [],
  _media: [],
  _view: [],
  _scroll: [],
  onClick(funct) {
    document.addEventListener("click", funct);
    this._click.push(funct);
  },
  offClick(funct) {
    document.removeEventListener("click", funct);
    this._click = this._click.filter((f) => f !== funct);
  },
  onMediaChange(funct) {
    media.large.addEventListener("change", funct);
    media.middle.addEventListener("change", funct);
    this._media.push(funct);
  },
  offMediaChange(funct) {
    media.large.removeEventListener("change", funct);
    media.middle.removeEventListener("change", funct);
    this._media = this._media.filter((f) => f !== funct);
  },
  onScroll(funct) {
    window.addEventListener("scroll", funct);
    this._scroll.push(funct);
  },
  offScroll(funct) {
    window.removeEventListener("scroll", funct);
    this._scroll = this._scroll.filter((f) => f !== funct);
  },
  onViewChange(funct) {
    this._view.push(funct);
  },
  offViewChange(funct) {
    this._view = this._view.filter((f) => f !== funct);
  },
  triggerViewChange() {
    this._view.forEach((f) => f());
  },
  clear() {
    this._click.forEach((f) => {
      document.removeEventListener("click", f);
    });
    this._media.forEach((f) => {
      media.large.removeEventListener("change", f);
      media.middle.removeEventListener("change", f);
    });
    this._scroll.forEach((f) => {
      window.removeEventListener("scroll", f);
    });
    this._click.length = 0;
    this._media.length = 0;
    this._view.length = 0;
    this._scroll.length = 0;
  },
});

const appMedia = () => ({
  large: matchMedia("(min-width: 1024px)"),
  middle: matchMedia("(min-width: 480px)"),
});

document.addEventListener("DOMContentLoaded", main);
