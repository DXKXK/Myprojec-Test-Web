let GamenData = {};
let WebUrl = '';
// 游戏标识
let GameChosen = '';
let LevelChosen = '';
let ChapterChosen = '';
let DLC = '';

// 对话相关变量
let DialogNum = 0;
let NowDialog = 0;
let DialogContent = [];
let IsNext = true;  // 是否允许进入下一句
let ContentMun = 0;
let NowContent = 0;
let DialogTimer = null; // 添加文字加载定时器变量

// Spine模型加载参数
let SpineBgData = {
    loading: false,
    showControls: false,
    premultipliedAlpha: true,
    backgroundColor: "#00000000",
    alpha: true,
    defaultMix: 1,
    resize: true,
    viewport: {
        // debugRender: true,
        x: -903.46,
        y: -509.78,
        width: 1813.49,
        height: 1021.76,
        padLeft: "0%",
        padRight: "0%",
        padTop: "0%",
        padBottom: "0%"
    }
}
let SpineIdleData = {
    loading: false,
    showControls: false,
    premultipliedAlpha: true,
    backgroundColor: "#00000000",
    alpha: true,
    defaultMix: 1,
    resize: true,
    viewport: {
        // debugRender: true,
        x: -464.05,
        y: -540.11,
        width: 736.00,
        height: 1058.66,
        padLeft: "0%",
        padRight: "0%",
        padTop: "0%",
        padBottom: "0%"
    }
}
let Level = {
    "Question": [],
    "Answer": []
}

// 获取元素
let Btn = document.getElementById("Btn");
let Finish = document.getElementById("Finish");
let CharacterIdle = document.getElementById("CharacterIdle");

// 初始化页面
function init(data) {
    DLC = 1;
    // console.log(data);
    GamenData = data;
    WebUrl = data.url;
    GameChosen = data.game;
    LevelChosen = data.level;
    ChapterChosen = data.chapter;
    Level["Question"] = data.data.Question;
    Level["Answer"] = data.data.Answer;
    // console.log(Level);
    // 加载Spine背景
    LoadBgSpine();
    // 初始化数据
    InitData();
}

// 加载Spine背景
function LoadBgSpine() {
    new spine.SpinePlayer(`SpineBg`, {
        jsonUrl: `${WebUrl}/GameAssets/${GameChosen}/GameLevelBg/GameLevel.json`,
        // skelUrl: `${WebUrl}/GameAssets/${GameChosen}/GameLevelBg/GameLevel.skel`,
        atlasUrl: `${WebUrl}/GameAssets/${GameChosen}/GameLevelBg/GameLevel.atlas`,
        animation: 'Anim_1',
        ...SpineBgData,
        success: function (player) {
            console.log(`WebBg Spine加载成功`);
            // 加载Spine立绘
            LoadIdleSpine();
        },
        error: function (error) {
            console.log(`WebBg Spine加载失败:`, error);
        }
    });
}
// 加载Spine立绘
function LoadIdleSpine() {
    new spine.SpinePlayer(`CharacterIdle`, {
        jsonUrl: `${WebUrl}/GameAssets/${GameChosen}/Role/Spine/Spine_Idle_${LevelChosen}.json`,
        // skelUrl: `${WebUrl}/GameAssets/${GameChosen}/Role/Spine/Spine_Idle_${LevelChosen}.skel`,
        atlasUrl: `${WebUrl}/GameAssets/${GameChosen}/Role/Spine/Spine_Idle_${LevelChosen}.atlas`,
        animation: `Anim_${DLC}`,
        ...SpineIdleData,
        success: function (player) {
            console.log(`Idle Spine加载成功`);
            // 加载方块
            InitBlock()
        },
        error: function (error) {
            console.log(`Idle Spine加载失败:`, error);
        }
    });
}

// 初始化按钮
function InitData() {
    // 加载自动归位按钮
    let AutoResetBtn = document.createElement(`img`);
    AutoResetBtn.id = `AutoResetBtn`;
    // 控制按钮(自动复位)
    AutoResetBtn.addEventListener(`click`, function () {
        AutoReset_y(0, 0);
    });
    AutoResetBtn.src = `${WebUrl}/GameAssets/Play.png`;
    AutoResetBtn.alt = `自动归位`;
    Btn.appendChild(AutoResetBtn);

    // 加载关闭按钮的图片
    let CloseImg = document.createElement(`img`);
    CloseImg.id = `CloseImg`;
    // 控制按钮(关闭按钮)
    CloseImg.addEventListener(`click`, function () {
        ToLevelChoose();
    });
    CloseImg.src = `${WebUrl}/GameAssets/Close.png`;
    CloseImg.alt = `关闭`;
    Btn.appendChild(CloseImg);

}


// 自动归位逻辑
let BlockBox = document.getElementById("BlockBox");
// 移动中的盒子
let MovingBox = null;
let MovingColor = null;
// 进入的盒子
let EnterBox = null;
let EnterColor = null;
// 放置的盒子
let DropBox = null;
let DropColor = null;
// 游戏数据
let BlockData = [];
function InitBlock() {
    // 深拷贝Question数据到BlockData中用于后续记录关卡
    deepCopy();
    // 根据Question数据构建关卡
    BlockBox.style.width = ((Level.Question[0].length * 55) + 5) + "px";
    BlockBox.style.height = ((Level.Question.length * 55) + 5) + "px";

    // 计数器，只计算实际加载的方块
    let blockCount = 0;

    Level.Question.forEach(function (x, xIndex) {
        x.forEach(function (y, yIndex) {
            if (y.Isshow) {
                let Block = document.createElement("div");
                Block.className = "block block-loading";
                Block.id = `Q${xIndex}-${yIndex}`;
                Block.style.backgroundColor = y.Color;
                // Block.style.backgroundImage = `url(${GamenData.url}/GameAssets/Blocks/${y.Image}.png)`;
                Block.style.left = 10 + (yIndex * 55) + "px";
                Block.style.top = 10 + (xIndex * 55) + "px";
                Block.style.zIndex = 1;
                Block.draggable = true;
                Block.setAttribute("data-position", `${xIndex}-${yIndex}`);
                Block.setAttribute("data-color", y.Color);
                Block.setAttribute("data-image", y.Image);

                // 初始状态设置为很小
                Block.style.width = "1px";
                Block.style.height = "1px";
                Block.style.opacity = "0";

                // 添加监听事件
                Block.addEventListener("dragstart", function (e) {
                    // console.log("开始拖动" + e.target.id);
                    MovingBox = document.getElementById(e.target.id);
                    // 识别拖动中的色块颜色
                    MovingColor = MovingBox.getAttribute("data-color");
                    // console.log(MovingColor);

                    MovingBox.style.opacity = 0.5;
                    MovingBox.style.zIndex = 9;
                });
                Block.addEventListener("dragend", function (e) {
                    // console.log("结束拖动" + e.target.id);
                    MovingBox.style.opacity = 1;
                });
                Block.addEventListener("dragover", function (e) {
                    e.preventDefault();
                    // console.log("拖动中" + e.target.id);

                    // 根据颜色匹配情况设置放置效果
                    if (EnterColor === MovingColor) {
                        // e.dataTransfer.dropEffect = 'move';
                        // e.target.style.cursor = 'move';
                    } else {
                        // e.dataTransfer.dropEffect = 'none';
                        // e.target.style.cursor = 'no-drop';
                        EnterBox.classList.add("no-drop");
                    }
                });
                Block.addEventListener("dragenter", function (e) {
                    // console.log("进入" + e.target.id);
                    EnterBox = document.getElementById(e.target.id);
                    // 识别进入的色块的颜色
                    EnterColor = EnterBox.getAttribute("data-color");
                    // console.log(EnterColor);
                    // 根据颜色匹配情况设置光标样式
                    if (EnterColor != MovingColor) {
                        EnterBox.classList.add("no-drop");
                    }
                });
                Block.addEventListener("dragleave", function (e) {
                    // console.log("离开" + e.target.id);
                    EnterBox.classList.remove("no-drop");
                    document.querySelectorAll('.block').forEach(item => {
                        item.classList.remove("no-drop");
                    });
                });
                Block.addEventListener("drop", function (e) {
                    e.preventDefault();
                    // console.log("放置" + e.target.id);
                    let Left = MovingBox.style.left;
                    let Top = MovingBox.style.top;
                    DropBox = document.getElementById(e.target.id);
                    // 识别放置的色块的颜色
                    DropColor = DropBox.getAttribute("data-color");
                    DropBox.zIndex = 9;
                    document.querySelectorAll('.block').forEach(item => {
                        item.classList.remove("no-drop");
                    });
                    // console.log(DropColor);

                    // 颜色是否匹配，匹配则放置色块
                    if (EnterColor == MovingColor) {
                        MovingBox.style.left = DropBox.style.left;
                        MovingBox.style.top = DropBox.style.top;
                        DropBox.style.left = Left;
                        DropBox.style.top = Top;
                        UpdateLevel();
                    }
                    MovingBox.style.opacity = 1;
                });


                // 添加延迟加载效果，只对实际加载的方块计数
                const delay = blockCount * 50; // 每个方块延迟50ms
                blockCount++;

                setTimeout(() => {
                    // 添加到盒子中
                    BlockBox.appendChild(Block);
                    let BlockImg = document.createElement("img");
                    BlockImg.className = "blockimg";
                    BlockImg.src = `${GamenData.url}/GameAssets/Blocks/${y.Image}.png`;
                    Block.appendChild(BlockImg);
                    Block.style.width = "50px";
                    Block.style.height = "50px";
                    Block.style.opacity = "1";
                }, delay);
            }
        });
    });

}

// 更新数组，通关检查
function UpdateLevel() {
    let data = {
        Isshow: false,
        Color: "",
        Image: "",
        Postion: ""
    };

    let MoveIndex = MovingBox.getAttribute("data-position").split("-");
    let Move_xIndex = parseInt(MoveIndex[0]);
    let Move_yIndex = parseInt(MoveIndex[1]);

    let DropIndex = DropBox.getAttribute("data-position").split("-");
    let Drop_xIndex = parseInt(DropIndex[0]);
    let Drop_yIndex = parseInt(DropIndex[1]);

    // 交换数组中对应色块的数据
    data.Ischeck = BlockData[Move_xIndex][Move_yIndex].Ischeck;
    data.Isshow = BlockData[Move_xIndex][Move_yIndex].Isshow;
    data.Color = BlockData[Move_xIndex][Move_yIndex].Color;
    data.Image = BlockData[Move_xIndex][Move_yIndex].Image;
    data.Postion = MovingBox.getAttribute("data-position");
    BlockData[Move_xIndex][Move_yIndex].Ischeck = BlockData[Drop_xIndex][Drop_yIndex].Ischeck;
    BlockData[Move_xIndex][Move_yIndex].Isshow = BlockData[Drop_xIndex][Drop_yIndex].Isshow;
    BlockData[Move_xIndex][Move_yIndex].Color = BlockData[Drop_xIndex][Drop_yIndex].Color;
    BlockData[Move_xIndex][Move_yIndex].Image = BlockData[Drop_xIndex][Drop_yIndex].Image;
    MovingBox.setAttribute("data-position", DropBox.getAttribute("data-position"));
    BlockData[Drop_xIndex][Drop_yIndex].Ischeck = data.Ischeck;
    BlockData[Drop_xIndex][Drop_yIndex].Isshow = data.Isshow;
    BlockData[Drop_xIndex][Drop_yIndex].Color = data.Color;
    BlockData[Drop_xIndex][Drop_yIndex].Image = data.Image;
    DropBox.setAttribute("data-position", data.Postion);

    if (arraysEqual(BlockData, Level.Answer)) {
        LevelFinish();
    }
}

// 深度比较两个数组是否相等（检查是否通关）
function arraysEqual(arr1, arr2) {
    if (arr1.length !== arr2.length) return false;

    for (let i = 0; i < arr1.length; i++) {
        if (arr1[i].length !== arr2[i].length) return false;

        for (let j = 0; j < arr1[i].length; j++) {
            const obj1 = arr1[i][j];
            const obj2 = arr2[i][j];

            // if (obj1.Isshow !== obj2.Isshow) return false;
            if (obj1.Color !== obj2.Color) return false;
            if (obj1.Image !== obj2.Image) return false;
        }
    }

    return true;
}

// 深拷贝Question数组
function deepCopy() {
    BlockData = JSON.parse(JSON.stringify(Level["Question"]));
}

function AutoReset_y(x, y) {
    if (y < Level.Question.length) {
        AutoReset_x(x, y);
    } else {
        // console.log("自动归位完成");
        // 重置数组
        BlockData.forEach(function (x, xIndex) {
            x.forEach(function (y, yIndex) {
                y.Ischeck = false;
            });
        });
    }
}
function AutoReset_x(x, y) {
    if (x < Level.Question[0].length) {
        FundBlock(x, y);
    } else {
        AutoReset_y(0, y + 1);
    }
}

// 寻找正确的位置
function FundBlock(x, y) {
    // return new Promise(resolve => {
    if (BlockData[y][x].Isshow) {
        let IndexData = {
            x: '',
            y: ''
        }

        IndexData = FindBlockIndex(x, y);
        // console.log(IndexData);
        console.log(`${y}-${x}  ----->  ${IndexData.x}-${IndexData.y}`);
        // console.log(BlockData);
        // 如果是同一个色块则不交换
        BlockData[IndexData.x][IndexData.y].Ischeck = true;
        if (IndexData.x === y && IndexData.y === x) {
            // console.log("同一个色块，不交换");
            AutoReset_x(x + 1, y);
        } else {
            // 获取到色块元素
            GetBlock(IndexData.x, IndexData.y, y, x);
            // 判断两个色块是否相同
            let MColor, DColor;
            let MBg, DBg;
            MColor = MovingBox.getAttribute("data-color");
            DColor = DropBox.getAttribute("data-color");
            // MBg = MovingBox.style.backgroundImage;
            // DBg = DropBox.style.backgroundImage;
            MBg = MovingBox.getAttribute("data-image");
            DBg = DropBox.getAttribute("data-image");
            if (MColor === DColor && MBg === DBg) {
                console.log("目标色块与当前色块相同，无需交换");
                AutoReset_x(x + 1, y);
            } else {
                let Left = MovingBox.style.left;
                let Top = MovingBox.style.top;
                MovingBox.style.left = DropBox.style.left;
                MovingBox.style.top = DropBox.style.top;
                DropBox.style.left = Left;
                DropBox.style.top = Top;

                setTimeout(() => {
                    UpdateLevel();
                    AutoReset_x(x + 1, y);
                }, 500);
            }

        }
    } else {
        AutoReset_x(x + 1, y);
    }
}
// 比较两个数据是否相同
function dataEqual(data1, data2) {
    if (data1.Color !== data2.Color) {
        return false;
    } else {
        if (data1.Image !== data2.Image) {
            return false;
        } else {
            return true;
        }
    }
}

// 获取色块元素
function GetBlock(x, y, xIndex, yIndex) {
    document.querySelectorAll('.block').forEach(item => {
        if (item.getAttribute("data-position") === `${x}-${y}`) {
            MovingBox = item;
        }
        if (item.getAttribute("data-position") === `${xIndex}-${yIndex}`) {
            DropBox = item;
        }
    });
}

// 寻找色块索引
function FindBlockIndex(x, y) {
    // 遍历游戏数据，寻找与Answer数组中对应位置的颜色相同的块
    for (let i = 0; i < Level.Question.length; i++) {
        for (let j = 0; j < Level.Question[i].length; j++) {
            // 比对前提，当前位置未被检查
            if (!BlockData[i][j].Ischeck) {
                // 未检查
                // console.log(`正在检查Q${i}-${j}`);
                if (dataEqual(BlockData[i][j], Level.Answer[y][x])) {
                    // console.log(`找到匹配色块Q${i}-${j}`);
                    // BlockData[i][j].Ischeck = true;
                    return { x: i, y: j };
                }
            }
        }
    }
}

// 关卡完成
function LevelFinish() {
    console.log("恭喜你，完成本关！");
    UploadData().then(() => {
        console.log("上传数据成功");
    })
        .then(() => {
            // 隐藏所有方块的图片
            document.querySelectorAll('.blockimg').forEach(item => {
                item.style.opacity = 0;
                item.style.transition = "opacity 1s";
            });
        })
        .then(() => {
            setTimeout(() => {
                // 隐藏所有方块
                document.querySelectorAll('.block').forEach(item => {
                    item.style.opacity = 0;
                    item.style.transition = "opacity 1s";
                });
            }, 1000);
        })
        .then(() => {
            setTimeout(() => {
                // 加载结算界面
                // 判断是否是最后一关
                if (ChapterChosen == 3) {
                    Finish.innerHTML = "";
                    // 加载对话界面
                    let Dialog = document.createElement(`div`);
                    Dialog.className = `dialog`;
                    Dialog.id = `Dialog`;
                    Finish.appendChild(Dialog);
                    // 是最后一关
                    Finish.style.zIndex = 99;
                    Finish.style.opacity = 1;
                    Finish.style.transform = "scale(1)"
                    CharacterIdle.style.zIndex = 100;
                    ContentLoad();
                } else {
                    Finish.innerHTML = "";
                    // 加载完成页面
                    let FinishImg = document.createElement(`img`);
                    FinishImg.className = `finishimg`;
                    FinishImg.src = `${WebUrl}/GameAssets/Level/Finish.png`;
                    FinishImg.alt = `完成`;
                    Finish.appendChild(FinishImg);
                    // 非最后一关
                    Finish.style.zIndex = 99;
                    Finish.style.opacity = 1;
                    Finish.style.transform = "scale(1)"
                }
            }, 1000);
        });
}
// 上传数据到服务器
function UploadData() {
    return new Promise(resolve => {
        // 参数：游戏ID，关卡ID，章节ID
        fetch(`${WebUrl}/api/setChapterInfo`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id: GameChosen,
                level: LevelChosen,
                chapter: ChapterChosen,
            })
        })
            .then(res => {
                if (!res.ok) {
                    throw new Error('Network response was not ok');
                }
                return res.json();
            })
            .then(data => {
                console.log(data);
                resolve();
            })
            .catch(error => {
                console.error('上传关卡数据失败:', error);
                reject(error);
            });
    });
}

// 文字加载准备
function ContentLoad() {
    IsNext = false;
    let Dialog = document.getElementById("Dialog");
    let DialogText = document.createElement(`div`);
    DialogText.className = `dialogtext`;
    DialogText.id = `DialogText`;
    Dialog.appendChild(DialogText);
    DialogNum = GamenData.dialog.length;
    // 将对话数据加载到DialogContent数组中（将文本分割成一个一个字）
    DialogContent = GamenData.dialog[NowDialog].split("");
    ContentMun = DialogContent.length;
    LoadDialogContent();
}

// 结算界面点击事件
Finish.addEventListener("click", function () {
    if (ChapterChosen !== 3) {
        // 无需加载对话
        ToLevelChoose();
    } else {
        // 需要加载对话，点击进入下一对话
        if (IsNext) {
            if (NowDialog + 1 < DialogNum) {
                // 加载下一段对话
                let Dialog = document.getElementById("Dialog");
                Dialog.innerHTML = "";
                NowDialog++;
                ContentLoad();
            } else {
                // 跳转回关卡选择页面
                console.log("对话加载完毕");
                ToLevelChoose();
            }
        } else {
            // 如果正在加载文字过程中，立即完成当前段落的文字加载
            SkipCurrentDialog();
        }
    }
});

// 跳转至关卡选择页面
function ToLevelChoose() {
    let data = {
        url: WebUrl,
        game: GameChosen,
        level: LevelChosen
    };
    localStorage.setItem('gameData', JSON.stringify(data));
    window.location.href = `${WebUrl}/HTML/game.html`;
}

// 加载对话文字
function LoadDialogContent() {
    console.log(`共有${DialogNum}段对话，当前进行第${NowDialog + 1}段`);
    let DialogText = document.getElementById("DialogText");
    DialogText.innerText = "";

    // 清除之前的定时器
    if (DialogTimer) {
        clearInterval(DialogTimer);
        DialogTimer = null;
    }

    NowContent = 0;
    DialogTimer = setInterval(() => {
        if (NowContent < ContentMun) {
            DialogText.innerText += DialogContent[NowContent];
            NowContent++;
        } else {
            clearInterval(DialogTimer);
            DialogTimer = null;
            console.log(`${NowDialog + 1}段对话加载完成`);
            NowContent = 0;
            IsNext = true;
        }
    }, 50);
}

// 立即完成当前对话的文字加载
function SkipCurrentDialog() {
    if (DialogTimer) {
        clearInterval(DialogTimer);
        DialogTimer = null;
    }

    let DialogText = document.getElementById("DialogText");
    // 立即显示所有文字
    DialogText.innerText = GamenData.dialog[NowDialog];
    NowContent = 0;
    IsNext = true;
}