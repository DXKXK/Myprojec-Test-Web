let WebUrl = '';
let GameChosen = '';
let LevelChosen = '';
let ChapterChosen = '';
let DLC = '';
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
let GameData = {}
let LevelData = {}

// 加载元素
let Idle = document.getElementById(`Idle`);
let Chapter = document.getElementById(`Chapter`);
let CloseBtn = document.getElementById(`CloseBtn`);
let GameChoseBG = document.getElementById(`GameChoseBG`);
let LetterStory = document.getElementById(`LetterStory`);
let LetterContent = document.getElementById(`LetterContent`);
let LevelChooseList = document.getElementById(`LevelChooseList`);
let LetterCharacterName = document.getElementById(`LetterCharacterName`);

function init(data) {
    console.log(data);
    WebUrl = data.url;
    GameChosen = data.game;
    DLC = 1;
    LoadBgSpine();
    InitData();

    // 如果是从关卡返回，则滚动到对应的关卡卡片
    if (data.level) {
        // 延迟执行以确保DOM已完全加载
        setTimeout(() => {
            const targetLevel = document.getElementById(`Level${data.level}`);
            if (targetLevel) {
                targetLevel.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });

                CardClick(data.level);
            }
        }, 100);
    }
}

// 加载背景Spine模型
function LoadBgSpine() {
    new spine.SpinePlayer(`SpineBg`, {
        jsonUrl: `${WebUrl}/GameAssets/${GameChosen}/SelectLevelBg/SelectLevel.json`,
        // skelUrl: `${WebUrl}/GameAssets/${GameChosen}/SelectLevelBg/SelectLevel.skel`,
        atlasUrl: `${WebUrl}/GameAssets/${GameChosen}/SelectLevelBg/SelectLevel.atlas`,
        animation: 'Anim_1',
        ...SpineData,
        success: function (player) {
            console.log(`WebBg Spine加载成功`);
        },
        error: function (error) {
            console.log(`WebBg Spine加载失败:`, error);
        }
    });
}

// 初始化数据
function InitData() {
    // 加载关闭按钮的图片
    let CloseImg = document.createElement(`img`);
    CloseImg.src = `${WebUrl}/GameAssets/Close.png`;
    CloseImg.alt = `关闭`;
    CloseBtn.appendChild(CloseImg);
    // LoadCardList();
    // 加载角色数据
    GetCharacterData().then(() => {
        // console.log(GameData);
        LoadCardList();
    })
}

// 获取游戏角色数据
function GetCharacterData() {
    return new Promise((resolve, reject) => {
        // 参数：游戏ID
        fetch(`${WebUrl}/api/getRoleInfo?id=${GameChosen}`, {
            method: 'GET',
        })
            .then(res => {
                if (!res.ok) {
                    throw new Error('Network response was not ok');
                }
                return res.json();
            })
            .then(data => {
                GameData = data;
                resolve();
            })
            .catch(error => {
                console.error('获取角色数据失败:', error);
                reject(error);
            });
    });
}
// 获取关卡数据
function GetLevelData() {
    return new Promise((resolve, reject) => {
        // 参数：游戏ID, 关卡ID
        fetch(`${WebUrl}/api/getLevelInfo?id=${GameChosen}&level=${LevelChosen}`, {
            method: 'GET',
        })
            .then(res => {
                if (!res.ok) {
                    throw new Error('Network response was not ok');
                }
                return res.json();
            })
            .then(data => {
                LevelData = data;
                // console.log(LevelData);
                resolve();
            })
            .catch(error => {
                console.error('获取关卡数据失败:', error);
                reject(error);
            });
    });
}

// 加载卡片列表
function LoadCardList() {
    for (let i = 1; i <= 10; i++) {
        LevelChooseList.innerHTML += `
            <div class="levelcard">
                <div class="level" id="Level${i}" onclick="CardClick(${i})">
                    <div class="levelcontent">
                        <div class="charactername">${GameData[`Level_${i}`].Role_Name.CHS}</div>
                        <div class="levelinfomation">${GameData[`Level_${i}`].Story_Synopsis}</div>
                    </div>
                    <img class="avatar" src="${WebUrl}/GameAssets/${GameChosen}/LetterImage/Letter_Unlock_${i}_${DLC}.png" alt="信封头像">
                </div>
            </div>
        `;
    }
}

// 控制按钮(关闭按钮)
CloseBtn.addEventListener(`click`, function () {
    let data = {
        game: GameChosen
    };
    localStorage.setItem('gameReturn', JSON.stringify(data));
    window.location.href = `${WebUrl}/index.html`;
});

// 进入关卡选择
function CardClick(level) {
    LevelChosen = level;
    // 设置立绘
    Idle.src = `${WebUrl}/GameAssets/${GameChosen}/Role/Role_Idle_${LevelChosen}_${DLC}.png`;
    // 设置角色名称
    LetterCharacterName.innerText = GameData[`Level_${LevelChosen}`].Role_Name.CHS;
    // 设置信件内容
    LetterStory.innerText = GameData[`Level_${LevelChosen}`].Story_Details;
    GetLevelData().then(() => {
        // console.log(LevelData.Data.length);
        // 加载章节许选择图案
        // let len = LevelData.Data.length;
        for (let i = 1; i <= Object.keys(LevelData.Data).length; i++) {
            if (!LevelData.Data[`Level_${LevelChosen}_${i}`].Is_Lock) {
                // 未上锁
                if (!LevelData.Data[`Level_${LevelChosen}_${i}`].Is_Complete) {
                    // 未完成
                    Chapter.innerHTML += `
                        <div draggable="false" class="chapteritem" onclick="ToLevel(${i})">
                            <img src="${WebUrl}/GameAssets/LevelCard/Unlocked_${i}.png" alt="章节">
                        </div>
                    `
                } else {
                    // 已完成
                    Chapter.innerHTML += `
                        <div draggable="false" class="chapteritem" onclick="ToLevel(${i})">
                            <img src="${WebUrl}/GameAssets/LevelCard/Ico.png" alt="章节">
                        </div>
                    `
                }
            } else {
                // 已上锁
                Chapter.innerHTML += `
                    <div draggable="false" class="chapteritem">
                        <img src="${WebUrl}/GameAssets/LevelCard/Locked.png" alt="章节">
                    </div>
                `
            }
        }
    })
        .then(() => {
            // 加载信封
            // console.log(`点击了第${level}关`);
            GameChoseBG.style.opacity = 1;
            GameChoseBG.style.transform = 'scale(1)';
            GameChoseBG.style.zIndex = 99;
            LevelChooseList.style.overflow = 'hidden';
        });
}

// 进入关卡
function ToLevel(chapter) {
    ChapterChosen = chapter;
    // console.log(`点击了第${level}关`);
    let data = {
        url: WebUrl,
        game: GameChosen,
        level: LevelChosen,
        chapter: ChapterChosen,
        data: LevelData.Data[`Level_${LevelChosen}_${ChapterChosen}`],
        dialog: ChapterChosen == 3 ? GameData[`Level_${LevelChosen}`].Story_End : ''
    };
    localStorage.setItem('gameData', JSON.stringify(data));
    window.location.href = `${WebUrl}/HTML/level.html`;
}

// 关闭关卡选择
function CloseCard() {
    GameChoseBG.style.opacity = 0;
    GameChoseBG.style.transform = 'scale(1.5)';
    GameChoseBG.style.zIndex = -1;
    LevelChooseList.style.overflow = 'auto';
    // 重置立绘
    Idle.src = ``;
    // 重置角色名称
    LetterCharacterName.innerText = ``;
    // 重置信件内容
    LetterStory.innerText = ``;
    // 重值关卡
    Chapter.innerHTML = ``;
}

GameChoseBG.addEventListener(`click`, function (e) {
    // 确保值点击了GameChoseBG空白处
    if (e.target === GameChoseBG) {
        CloseCard();
    }
});
LetterContent.addEventListener(`click`, function (e) {
    // 阻止冒泡
    e.stopPropagation();
});