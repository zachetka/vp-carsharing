$(function(){
    $('.cover__slider').slick({
        arrows: false,
        dots: true,
        autoplay: true,
        fade: true
    });

    $('.reviews__slider').slick({
        arrows: false,
        dots: true,
        slidesToShow: 4,
        slidesToScroll: 1,
        autoplay: true,
        responsive: [
          {
            breakpoint: 1100,
            settings: {
              slidesToShow: 3
            }
          },
          {
            breakpoint: 800,
            settings: {
              slidesToShow: 2
            }
          },
          {
            breakpoint: 600,
            settings: {
              slidesToShow: 1
            }
          }
        ]        
    });

    $('.menu__btn').on('click', function(){
        $('.menu__list').toggleClass('menu__list--active');
    });
});