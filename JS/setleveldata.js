function ResetLevelData(id) {
    const data = JSON.parse(localStorage.getItem('gameLevel'));
    let LevelData = data;
    let gameData = LevelData[`SakuraHime_${id}`];

    // 遍历所有关卡 (Level_1 到 Level_10)
    for (let level = 1; level <= 10; level++) {
        let levelKey = `Level_${level}`;
        if (gameData[levelKey] && gameData[levelKey].Data) {
            let levelData = gameData[levelKey].Data;

            // 遍历所有章节 (Level_x_1 到 Level_x_3)
            for (let chapter = 1; chapter <= 3; chapter++) {
                let chapterKey = `Level_${level}_${chapter}`;
                if (levelData[chapterKey]) {
                    // 重置完成状态为false
                    levelData[chapterKey].Is_Complete = false;

                    // 第一章解锁(Is_Lock: false)，其余章节锁定(Is_Lock: true)
                    if (chapter === 1) {
                        levelData[chapterKey].Is_Lock = false;
                    } else {
                        levelData[chapterKey].Is_Lock = true;
                    }
                }
            }
        }
    }
    localStorage.setItem('gameLevel', JSON.stringify(LevelData));
    console.log("游戏数据重置成功");
}

function UpdateLevelData(id, level, chapter) {
    const data = JSON.parse(localStorage.getItem('gameLevel'));
    let LevelData = data;
    LevelData[`SakuraHime_${id}`][`Level_${level}`]["Data"][`Level_${level}_${chapter}`].Is_Complete = true;
    // 解锁下一章
    let nextChapter = chapter + 1;
    if (nextChapter <= 3) {
        LevelData[`SakuraHime_${id}`][`Level_${level}`]["Data"][`Level_${level}_${nextChapter}`].Is_Lock = false;
    }
    localStorage.setItem('gameLevel', JSON.stringify(LevelData));
    console.log("游戏数据更新成功");
}
