// 当前选中
let GameChosen = '';
// 总共游戏数量
let GameCount = 5;
// 用于确定两侧图片分配
let Center = (GameChosen + Math.floor(GameCount / 2)) % GameCount;
// Spine模型加载参数
let SpineData = {
    loading: false,
    showControls: false,
    premultipliedAlpha: true,
    backgroundColor: "#00000000",
    alpha: true,
    defaultMix: 1,
    resize: true,
    // viewport: {
    // },
    viewport: {
        // debugRender: true,
        x: -965.66,
        y: -549.82,
        width: 1931.32,
        height: 1099.78,
        padLeft: "0%",
        padRight: "0%",
        padTop: "0%",
        padBottom: "0%"
    }
}
// Spine模型加载状态
let SpineLodaingState = {
    SpineModel1: false,
    SpineModel2: false,
    SpineModel3: false,
    SpineModel4: false,
    SpineModel5: false,
}
let WebUrl = '';
let IsReturn = false;

// 储存Spine实例
let SpinePlayer = {};
let SpineDLC = 1;

// 获取元素
let GameStart = document.getElementById("GameStart");
let GameReturn = document.getElementById("GameReturn");
let GameReSet = document.getElementById("GameReSet");
let ImgBox = document.getElementById("ImgBox");
let GameLogo = document.getElementById("GameLogo");
let BG = document.getElementById("BG");

window.onload = function () {
    const data = JSON.parse(localStorage.getItem('gameReturn'));
    // const LevelData = JSON.parse(localStorage.getItem('gameLevel'));
    const LevelDataRaw = localStorage.getItem('gameLevel');
    let LevelData = null;
    try {
        LevelData = LevelDataRaw ? JSON.parse(LevelDataRaw) : null;
    } catch (e) {
        console.warn('解析 gameLevel 失败', e);
    }
    if (!LevelData) {   // 只要没有有效数据就去拉取
        fetch(`${WebUrl}GameAssets/LevelData.json`)
            .then(res => {
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                return res.json();
            })
            .then(data => {
                localStorage.setItem('gameLevel', JSON.stringify(data));
                console.log('游戏等级数据已写入 localStorage');
            })
            .catch(err => {
                console.error('加载 LevelData.json 失败', err);
                // 可以设置一个默认的空对象，避免反复请求
                localStorage.setItem('gameLevel', JSON.stringify({}));
            });
    }
    const DLC = 1;
    if (DLC) {
        SpineDLC = DLC;
    } else {
        localStorage.setItem('gameDLC', JSON.stringify(1));
    }
    if (data) {
        // console.log(data);
        localStorage.removeItem('gameReturn');
        // 重设GameChosen
        GameChosen = data.game - 1;
        Center = getCenter();
        IsReturn = true;
    } else {
        GameChosen = 0;
    }
    // 获取URL参数
    // WebUrl = window.location.protocol + "//" + window.location.host;
    WebUrl = '.';
    console.log(WebUrl);
    for (let i = 0; i < GameCount; i++) {
        document.getElementById(`Game${i}`).addEventListener("click", function () {
            SideGameChose(i);
        });
        document.getElementById(`Game${i}`).addEventListener("touchend", function () {
            SideGameChose(i);
        })
    }
    Init();
    SpineContainer();
}

// 计算Center值,用于区别两侧图片
function getCenter() {
    return (GameChosen + Math.floor(GameCount / 2)) % GameCount;
}

// 游戏选项卡被点击的时候
function SideGameChose(num) {
    // console.log("选择游戏: " + num);
    if (num != GameChosen) {
        if (num == (GameChosen - 1 + GameCount) % GameCount) {
            GameChosen = num;
            Center = (Center - 1 + GameCount) % GameCount;
            Init();
        } else if (num == (GameChosen + 1) % GameCount) {
            GameChosen = num;
            Center = (Center + 1) % GameCount;
            Init();
        }
    } else {
        GameChoose(num);
    }
}

// 游戏选中
function GameChoose(num) {
    GameChosen = num;
    let Game = document.getElementById(`Game${num}`);
    // 放大选中项
    Game.classList.remove("active");
    Game.classList.add("choose");
    // 展示遮罩层
    BG.style.position = "fixed";
    BG.style.backgroundColor = "black";
    BG.style.zIndex = "3";
    // BG.style.display = "block";
    // 显示选中项Logo
    ImgBox.style.opacity = "1";
    ImgBox.style.zIndex = "7";
    GameLogo.src = `${WebUrl}/GameAssets/${num + 1}/Cover/Logo.png`;
    GameLogo.style.opacity = "1";
    // 显示控制按钮
    GameReturn.style.opacity = "1";
    GameReturn.style.zIndex = "6";
    GameStart.style.opacity = "1";
    GameStart.style.zIndex = "6";
    GameReSet.style.opacity = "1";
    GameReSet.style.zIndex = "6";
}
// 控制按钮(返回选择)
GameReturn.addEventListener("click", function () {
    let num = GameChosen;
    let Game = document.getElementById(`Game${num}`);
    // 移除遮罩层
    BG.style.position = "none";
    BG.style.backgroundColor = "transparent"
    BG.style.zIndex = "-1";
    // BG.style.display = "none";
    // 重置选中项
    Game.classList.remove("choose");
    Game.classList.add("active");
    // 显示选中项Logo
    ImgBox.style.opacity = "0";
    ImgBox.style.zIndex = "-1";
    GameLogo.src = '';
    GameLogo.style.opacity = "0";
    // 隐藏控制按钮
    GameReturn.style.opacity = "0";
    GameReturn.style.zIndex = "-1";
    GameStart.style.opacity = "0";
    GameStart.style.zIndex = "-1";
    GameReSet.style.opacity = "0";
    GameReSet.style.zIndex = "-1";
});
// 控制按钮(开始游戏)
GameStart.addEventListener("click", function () {
    IsReturn = false;
    // 网页跳转URL/HTML/letter.html
    let data = {
        game: GameChosen + 1,
        url: WebUrl
    };
    localStorage.setItem('gameData', JSON.stringify(data));
    window.location.href = `${WebUrl}/HTML/game.html`;
    // 切换DLC
    // SpineDLC = (SpineDLC % 2) + 1;
    // console.log(`切换DLC: ${SpineDLC}`);
    // Object.keys(SpinePlayer).forEach(key => {
    //     SpinePlayer[key].setAnimation(`Anim_${SpineDLC}`);
    // });
});
// 控制按钮(重置进度)
GameReSet.addEventListener("click", function () {
    // confirm("功能未开放");
    // 弹出提示，询问是否重置
    let isReset = confirm("是否重置进度?");
    if (isReset) {
        ResetLevelData(GameChosen + 1);
        //     // 确认，发送重置请求
        //     fetch(`${WebUrl}/api/resetProgress`, {
        //         method: 'POST',
        //         headers: {
        //             'Content-Type': 'application/json'
        //         },
        //         body: JSON.stringify({
        //             id: GameChosen + 1
        //         })
        //     })
        //     .then(response => response.json())
        //     .then(data => {
        //         console.log(data);
        //     });
    } else {
        // 取消
    }
});

//  加载Spine实例
function SpineContainer() {
    for (let i = 1; i <= GameCount; i++) {
        SpinePlayer[`SpineModel${i}`] = new spine.SpinePlayer(`Game${i - 1}`, {
            jsonUrl: `${WebUrl}/GameAssets/${i}/Cover/Theme.json`,
            // skelUrl: `${WebUrl}/GameAssets/${i}/Cover/Theme.skel`,
            atlasUrl: `${WebUrl}/GameAssets/${i}/Cover/Theme.atlas`,
            animation: `Anim_${SpineDLC}`,
            ...SpineData,
            success: function (player) {
                console.log(`Game${i - 1} Spine加载成功`);
                SpineLodaingState[`SpineModel${i}`] = true;
                if (IsReturn) {
                    GameChoose(GameChosen);
                }
                // console.log(SpinePlayer)
            },
            error: function (error) {
                console.log(`Game${i - 1} Spine加载失败:`, error);
            }
        });
    }
}

// // 控制按钮(上一张)
// document.getElementById("PrevBtn").addEventListener("click", function() {
//     GameChosen = (GameChosen - 1 + GameCount) % GameCount;
//     Center = (Center - 1 + GameCount) % GameCount;
//     Init();
// });
// // 控制按钮(下一张)
// document.getElementById("NextBtn").addEventListener("click", function() {
//     GameChosen = (GameChosen + 1) % GameCount;
//     Center = (Center + 1) % GameCount;
//     Init();
// });

// 设置两侧播图
function Init() {
    // console.log("Center: " + Center);
    let CurrGame = document.getElementById(`Game${GameChosen}`);
    CurrGame.classList.remove("prev", "next");
    CurrGame.classList.add("active");
    CurrGame.style.zIndex = GameCount;
    let Curr = GameChosen;
    let Zindex = Math.ceil(GameCount / 2);
    SetPrev(Curr, Zindex);
    SetNext(Curr, Zindex);
}

// 设置上一个轮播图
function SetPrev(num, Zindex) {
    let Prev = (num - 1 + GameCount) % GameCount;
    if (Prev != Center) {
        // console.log("Prev" + Prev);
        let PrevGame = document.getElementById(`Game${Prev}`);
        PrevGame.classList.remove("active", "next");
        PrevGame.classList.add("prev");
        PrevGame.style.zIndex = Zindex;
        SetPrev(Prev, Zindex - 1);
    }
}
// 设置下一个轮播图
function SetNext(num, Zindex) {
    if (num != Center) {
        let Next = (num + 1) % GameCount;
        // console.log("Next" + Next);
        let NextGame = document.getElementById(`Game${Next}`);
        NextGame.classList.remove("active", "prev");
        NextGame.classList.add("next");
        NextGame.style.zIndex = Zindex;
        SetNext(Next, Zindex - 1);
    }
}