import $ from "jquery";

(($) => {

    let yOffset = 0; // 현재 스크롤 높이 저장
    let currentScene = 0; // 현재 활성화 된 씬
    let prevScrollHeight = 0; // 현재 스크롤 위치보다 이전에 있는 섹션들 높이 합
    let sceneChange = false; // 씬이 변경될 때 활성화

    // 정보 저장
    const sceneInfo = [
        {
            // 0
            type: 'sticky',
            heightNum: 5,
            scrollHeight: 0,
            objs: {
                container: $('#scene-0'),
                messageA: $('#scene-0 .main-message.message-a'),
                messageB: $('#scene-0 .main-message.message-b'),
                messageC: $('#scene-0 .main-message.message-c'),
                messageD: $('#scene-0 .main-message.message-d'),
            },
            values: {
                messageA_opacity_in: [0, 1, { start: 0.1, end: 0.2 }],
                messageB_opacity_in: [0, 1, { start: 0.4, end: 0.5 }],
                messageC_opacity_in: [0, 1, { start: 0.7, end: 0.8 }],
                messageA_translateX_in: [-10, 0, { start: 0.1, end: 0.2 }],
                messageB_translateY_in: [-15, 0, { start: 0.4, end: 0.5 }],
                messageC_translateX_in: [-5, 0, { start: 0.7, end: 0.8 }],
                messageA_opacity_out: [1, 0, { start: 0.25, end: 0.35 }],
                messageB_opacity_out: [1, 0, { start: 0.55, end: 0.65 }],
                messageC_opacity_out: [1, 0, { start: 0.85, end: 0.95 }],
                messageA_translateX_out: [0, 10, { start: 0.25, end: 0.35 }],
                messageB_translateY_out: [0, 15, { start: 0.55, end: 0.65 }],
                messageC_translateX_out: [0, 5, { start: 0.85, end: 0.95 }],
            }
        },
        {
            // 1
            type: 'normal',
            heightNum: 5,
            scrollHeight: 0,
            objs: {
                container: $('#scene-1'),
                description: $('#scene-1 .description'),
            },
            values: {
                background: [0, 300],
            }
        },
        {
            // 2
            type: 'sticky',
            heightNum: 2,
            scrollHeight: 0,
            objs: {
                container: $('#scene-2'),
                canvas: $('#video-canvas'),
                context: $('#video-canvas')[0].getContext('2d'),
                videoImages: []
            },
            values: {
                videoImageCount: 249,
                imageSequence: [0, 248, { start: 0, end: 0 }],
            }
        }
    ];

    // 캔버스 이미지 세팅
    const setCanvasImage = () => {
        let imgElem;
        for(let i = 0; i < sceneInfo[2].values.videoImageCount; i++ ){
            imgElem = new Image();
            imgElem.src = `./video/001/man_${1 + i}.jpg`;
            sceneInfo[2].objs.videoImages.push(imgElem);
        }
    }

    // 씬 레이아웃 설정(높이 입력 등)
    const setLayout = () => {
        for( let i = 0; i < sceneInfo.length; i++ ){
            if( sceneInfo[i].type === 'sticky' ){
                sceneInfo[i].scrollHeight = sceneInfo[i].heightNum * window.innerHeight;
            }else if ( sceneInfo[i].type === 'normal' ){
                sceneInfo[i].objs.container.css({
                    'height': `auto`
                })
                sceneInfo[i].scrollHeight = sceneInfo[i].objs.container.innerHeight();
            }
            // sceneInfo[i].objs.container.style.height = `${ sceneInfo[i].scrollHeight }px`;
            sceneInfo[i].objs.container.css({
                'height': `${ sceneInfo[i].scrollHeight }px`
            })
        }

        // 현재 currentScene 구하기 (새로고침 등등)
        // 현재 스크롤높이 값보다 섹션 총합을 비교했을 때, 스크롤 높이값이 작아지면 그 값이 현재 보고 있는 씬
        yOffset = pageYOffset;
        let totalScrollHeight = 0;
        for( let i = 0; i <sceneInfo.length; i++ ){
            totalScrollHeight += sceneInfo[i].scrollHeight;
            if( totalScrollHeight >= yOffset ){
                currentScene = i;
                break;
            }
        }
        // console.log(totalScrollHeight, currentScene);
        $(`#scene-${currentScene}`).addClass('is-motion').siblings().removeClass('is-motion');

        // canvas 브라우저 사이즈에 맞춰서 조정
        var winWidth = document.body.offsetWidth;
        var winHeight = window.innerHeight;
        if( winHeight / winWidth > 0.5625 ){
            sceneInfo[2].objs.canvas.removeClass().addClass('horizontal');
        }else{
            sceneInfo[2].objs.canvas.removeClass().addClass('vertical');
        }
    }

    const calcValues = (values, currentYOffset) => {
        let rv;
        const scrollHeight = sceneInfo[currentScene].scrollHeight;
        const scrollRatio = currentYOffset / scrollHeight;

        if( values.length === 3 ){
            // 구간 설정이 되어 있으면 여기서 실행
            const partScrollStart = values[2].start * scrollHeight;
            const partScrollEnd = values[2].end * scrollHeight;
            const partScrollHeight = partScrollEnd - partScrollStart;

            if( currentYOffset >= partScrollStart && currentYOffset <= partScrollEnd ){
                rv = ( currentYOffset - partScrollStart ) / partScrollHeight * ( values[1] - values[0] ) + values[0];
            }else if( currentYOffset < partScrollStart ){
                rv = values[0];
            }else if( currentYOffset > partScrollEnd ){
                rv = values[1];
            }
        }else{
            rv = scrollRatio * ( values[1] - values[0] ) + values[0]; //ex. 10 ~ 20 의 값이 들어오고 스크롤 비율이 0.5: 0.5 * (20 - 10) + 10 = 15
        }
        return rv;
    }

    const playAnimation = () => {
        const objs = sceneInfo[currentScene].objs;
        const values = sceneInfo[currentScene].values;
        const currentYOffset = yOffset - prevScrollHeight; // 현재 씬에서의 스크롤 높이
        const scrollHeight = sceneInfo[currentScene].scrollHeight;
        const scrollRatio = currentYOffset / scrollHeight; // 현재 씬에서 스크롤 높이만큼의 비율

        switch (currentScene){
            case 0:
                if( scrollRatio <= 0.22 ){
                    objs.messageA.css({
                        'opacity': calcValues(values.messageA_opacity_in, currentYOffset),
                        'transform': `translate3d(${calcValues(values.messageA_translateX_in, currentYOffset)}%, -50%, 0)`
                    });
                }else{
                    objs.messageA.css({
                        'opacity': calcValues(values.messageA_opacity_out, currentYOffset),
                        'transform': `translate3d(${calcValues(values.messageA_translateX_out, currentYOffset)}%, -50%, 0)`
                    });
                }
                if( scrollRatio <= 0.52 ){
                    objs.messageB.css({
                        'opacity': calcValues(values.messageB_opacity_in, currentYOffset),
                        'transform': `translate3d(0, ${-50 + calcValues(values.messageB_translateY_in, currentYOffset)}%, 0)`
                    });
                }else{
                    objs.messageB.css({
                        'opacity': calcValues(values.messageB_opacity_out, currentYOffset),
                        'transform': `translate3d(0, ${-50 + calcValues(values.messageB_translateY_out, currentYOffset)}%, 0)`
                    });
                }
                if( scrollRatio <= 0.82 ){
                    objs.messageC.css({
                        'opacity': calcValues(values.messageC_opacity_in, currentYOffset),
                        'transform': `translate3d(${calcValues(values.messageC_translateX_in, currentYOffset)}%, -50%, 0)`
                    });
                }else{
                    // objs.messageC.css({
                    //     'opacity': calcValues(values.messageC_opacity_out, currentYOffset),
                    //     'transform': `translate3d(${calcValues(values.messageC_translateX_out, currentYOffset)}%, -50%, 0)`
                    // });
                }
                break;
            case 1:
                objs.description.css({
                    'background-image': `linear-gradient(150deg, rgb(15, 68, 167) ${100 - calcValues(values.background, currentYOffset)}%, rgb(217, 90, 90) ${200 - calcValues(values.background, currentYOffset)}%, rgb(76, 167, 84) ${300 - calcValues(values.background, currentYOffset)}%)`
                })
                break;
            case 2:
                values.imageSequence[2].end = (scrollHeight - window.innerHeight) / scrollHeight;
                let sequence = Math.round(calcValues(values.imageSequence, currentYOffset));
                objs.context.drawImage(objs.videoImages[sequence], 0, 0);
                // console.log(sequence)
                if( currentYOffset >= scrollHeight - window.innerHeight ){
                    // console.log('end');
                    objs.container.find('.canvas-wrap').addClass('is-bottom');
                }else{
                    objs.container.find('.canvas-wrap').removeClass('is-bottom');
                }
                break;
        }
    }

    const scrollLoop = () => {
        // 스크롤 중... 현재 씬 구하기
        sceneChange = false;
        prevScrollHeight = 0;
        for( let i = 0; i < currentScene; i++ ){
            prevScrollHeight += sceneInfo[i].scrollHeight;
        }

        if( yOffset > prevScrollHeight + sceneInfo[currentScene].scrollHeight ){
            sceneChange = true;
            currentScene++;
            $(`#scene-${currentScene}`).addClass('is-motion').siblings().removeClass('is-motion');
        }

        if( yOffset < prevScrollHeight ){
            sceneChange = true;
            if( currentScene === 0 ) return; // - 방지
            currentScene--;
            $(`#scene-${currentScene}`).addClass('is-motion').siblings().removeClass('is-motion');
        }

        if( sceneChange ) return;
        playAnimation();
    }

    window.addEventListener('scroll', () => {
        yOffset = window.pageYOffset;
        scrollLoop();
    });

    window.addEventListener('resize', setLayout);

    window.addEventListener('load', () => {
        setLayout();
        sceneInfo[2].objs.context.drawImage(sceneInfo[2].objs.videoImages[0], 0, 0);
    });

    setCanvasImage();

})($);