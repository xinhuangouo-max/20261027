// 宣告全域變數
let canvas; // 畫布物件
let gridRows = 3; // 拼圖網格行數 (3x3)
let gridCols = 3; // 拼圖網格列數 (3x3)
let totalPieces = 9; // 總拼圖塊數量
let pieces = []; // 存放 9 塊拼圖資料的陣列
let questions = []; // 存放 9 道 p5.js 題目的陣列
let activeQuestionIndex = -1; // 當前正在回答的題目索引 (-1 代表無)
let quizState = 'GRID'; // 遊戲狀態: 'GRID' (選擇九宮格), 'QUIZ' (答題中), 'RESULT' (顯示單題結果), 'FINISHED' (全部拼完結算)
let selectedOption = -1; // 當前選擇的選項索引
let timerStart = 0; // 遊戲開始時間
let timerEnd = 0; // 遊戲結束時間
let totalTime = 0; // 花費總時間(秒)
let score = 0; // 總得分
let wrongGrids = []; // 答錯的格子編號陣列
let confetti = []; // 彩帶粒子陣列
let showFullImageModal = false; // 是否顯示完整圖片彈窗
let sourceImg; // 用於切割的畫布圖像 buffer

function setup() {
  // 建立全螢幕畫布
  canvas = createCanvas(windowWidth, windowHeight);
  // 設定文字對齊方式為居中
  textAlign(CENTER, CENTER);
  
  // 產生動態教學圖像 buffer (用於拼圖圖案)
  createSourceImage();
  
  // 初始化 p5.js 簡易教學題目
  initQuestions();
  
  // 初始化 9 塊拼圖資料結構與位置
  initPieces();
  
  // 記錄計時開始點
  timerStart = millis();
}

function windowResized() {
  // 當視窗大小改變時，重置畫布大小以達到響應式效果
  resizeCanvas(windowWidth, windowHeight);
  // 重新計算拼圖與面板位置
  recalculateLayout();
}

function createSourceImage() {
  // 建立一個與畫布比例相符的離線繪圖板作為拼圖圖案
  sourceImg = createGraphics(600, 600);
  sourceImg.background(30, 41, 59); // 暗藍色背景
  
  // 在圖案上畫些 p5.js 元素的裝飾
  sourceImg.stroke(255); // 白色邊框
  sourceImg.strokeWeight(4); // 邊框粗細
  sourceImg.fill(244, 63, 94); // 紅色粉彩
  sourceImg.circle(300, 200, 180); // 畫圓形 (ellipse/circle)
  
  sourceImg.fill(59, 130, 246); // 藍色
  sourceImg.rect(120, 350, 160, 160, 20); // 畫圓角矩形 (rect)
  
  sourceImg.fill(34, 197, 94); // 綠色
  sourceImg.triangle(450, 510, 370, 350, 530, 350); // 畫三角形 (triangle)
  
  sourceImg.fill(255); // 白色文字
  sourceImg.noStroke(); // 無邊框
  sourceImg.textSize(36); // 文字大小
  sourceImg.textAlign(CENTER, CENTER); // 文字居中
  sourceImg.text("p5.js Code World", 300, 80); // 繪製標題文字
}

function initQuestions() {
  // 9 道基礎 p5.js 觀念選擇題
  questions = [
    { q: "1. p5.js 中用來設定畫布大小的函式是什麼？", options: ["A. createCanvas()", "B. setWindow()", "C. makeCanvas()"], answer: 0 },
    { q: "2. 哪一個函式只會在程式開始時執行一次？", options: ["A. draw()", "B. setup()", "C. start()"], answer: 1 },
    { q: "3. 哪一個函式會不斷重複執行以進行繪圖？", options: ["A. loop()", "B. setup()", "C. draw()"], answer: 2 },
    { q: "4. 如何設定圖形的填滿顏色？", options: ["A. fill()", "B. color()", "C. background()"], answer: 0 },
    { q: "5. 哪一個函式用來畫出一個圓形？", options: ["A. rect()", "B. circle()", "C. line()"], answer: 1 },
    { q: "6. 要設定線條或邊框顏色時，應使用哪個函式？", options: ["A. stroke()", "B. lineStyle()", "C. border()"], answer: 0 },
    { q: "7. 畫面背景顏色的設定函式為？", options: ["A. fill()", "B. background()", "C. clear()"], answer: 1 },
    { q: "8. 繪製矩形的 p5.js 語法是哪一個？", options: ["A. square()", "B. box()", "C. rect()"], answer: 2 },
    { q: "9. 滑鼠目前的 X 軸座標變數名稱是什麼？", options: ["A. mouseX", "B. xMouse", "C. cursorX"], answer: 0 }
  ];
}

function initPieces() {
  pieces = []; // 清空陣列
  score = 0; // 重置分數
  wrongGrids = []; // 清空錯題紀錄
  confetti = []; // 清空彩帶
  quizState = 'GRID'; // 恢復選單狀態
  timerStart = millis(); // 重新計時

  // 計算佈局參數
  let boardSize = min(width * 0.4, height * 0.6); // 拼圖板尺寸
  let pieceSize = boardSize / 3; // 單個拼圖塊尺寸
  
  // 建立 9 個拼圖塊的物件
  for (let i = 0; i < totalPieces; i++) {
    let row = floor(i / 3); // 計算行數
    let col = i % 3; // 計算列數
    
    // 預設拼圖塊的位置與狀態
    pieces.push({
      id: i, // 拼圖編號 (0-8)
      row: row, // 目標行
      col: col, // 目標列
      unlocked: false, // 是否已解鎖(答題後解鎖)
      isCorrect: false, // 題目是否答對
      placed: false, // 是否已正確吸附到拼圖板上
      currentX: 0, // 當前渲染 X 座標
      currentY: 0, // 當前渲染 Y 座標
      targetX: 0, // 拼圖板目標 X
      targetY: 0, // 拼圖板目標 Y
      homeX: 0, // 解鎖後暫存區 X
      homeY: 0, // 解鎖後暫存區 Y
      isDragging: false, // 是否正在拖曳中
      dragOffsetX: 0, // 拖曳偏移量 X
      dragOffsetY: 0 // 拖曳偏移量 Y
    });
  }
  
  // 更新計算各塊座標
  recalculateLayout();
}

function recalculateLayout() {
  let boardSize = min(width * 0.38, height * 0.55); // 計算響應式拼圖板大小
  let pieceSize = boardSize / 3; // 單塊尺寸
  
  // 拼圖板中心置中偏左
  let boardStartX = width * 0.55 - boardSize / 2;
  let boardStartY = height * 0.45 - boardSize / 2;
  
  // 右側/下方的待拼區域
  let benchStartX = width * 0.05;
  let benchStartY = height * 0.2;

  for (let i = 0; i < totalPieces; i++) {
    let p = pieces[i];
    // 計算拼圖板上的正確目標位置
    p.targetX = boardStartX + p.col * pieceSize;
    p.targetY = boardStartY + p.row * pieceSize;
    
    // 計算解鎖後放置的備用位置 (散落於左側區域)
    p.homeX = benchStartX + (i % 3) * (pieceSize * 1.1);
    p.homeY = benchStartY + floor(i / 3) * (pieceSize * 1.1);
    
    // 如果尚未被放置，更新當前座標
    if (!p.placed && !p.isDragging) {
      p.currentX = p.homeX;
      p.currentY = p.homeY;
    } else if (p.placed) {
      p.currentX = p.targetX;
      p.currentY = p.targetY;
    }
  }
}

function draw() {
  background(15, 23, 42); // 深色背景 (Slate 900)

  // 根據當前狀態繪製畫面
  if (quizState === 'FINISHED') {
    drawFinishedState(); // 全部完成畫面
  } else {
    drawMainGame(); // 主遊戲/答題畫面
  }

  // 若觸發彩帶效果則持續更新繪製彩帶
  if (confetti.length > 0) {
    updateAndDrawConfetti();
  }
  
  // 如果開啟查看原圖彈窗
  if (showFullImageModal) {
    drawFullImageModal();
  }
}

function drawMainGame() {
  let boardSize = min(width * 0.38, height * 0.55); // 取得響應式板面大小
  let pieceSize = boardSize / 3; // 塊大小
  let boardStartX = width * 0.55 - boardSize / 2; // 板面起點 X
  let boardStartY = height * 0.45 - boardSize / 2; // 板面起點 Y

  // 繪製頂部標題與說明文字
  fill(255); // 白色文字
  textSize(28); // 字體大小
  text("p5.js 基礎程式設計 - 拼圖測驗系統", width / 2, 40); // 標題
  textSize(16); // 子標題大小
  fill(148, 163, 184); // 淺灰色
  text("點擊鎖定方塊(?) 進行答題解鎖，解鎖後拖曳至右側拼圖板", width / 2, 75);

  // 繪製右側/中間的拼圖目標底板 (九宮格框架)
  stroke(71, 85, 105); // 框架邊線顏色
  strokeWeight(2); // 邊線寬度
  fill(30, 41, 59); // 框架底色
  rect(boardStartX - 5, boardStartY - 5, boardSize + 10, boardSize + 10, 10); // 底板外框

  // 畫出底板 9 格網格線
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      let x = boardStartX + c * pieceSize;
      let y = boardStartY + r * pieceSize;
      fill(51, 65, 85);
      rect(x, y, pieceSize, pieceSize); // 格子底色
      fill(100, 116, 139);
      textSize(14);
      text(`位置 ${r * 3 + c + 1}`, x + pieceSize / 2, y + pieceSize / 2); // 提示格子編號
    }
  }

  // 繪製 9 個拼圖塊 (包含未解鎖與已解鎖)
  for (let i = 0; i < totalPieces; i++) {
    let p = pieces[i];
    
    // 如果拼圖塊尚未解鎖（顯示為「?」按鈕）
    if (!p.unlocked) {
      fill(71, 85, 105);
      stroke(148, 163, 184);
      strokeWeight(2);
      rect(p.homeX, p.homeY, pieceSize, pieceSize, 8); // 繪製方塊
      
      fill(255);
      textSize(32);
      text("?", p.homeX + pieceSize / 2, p.homeY + pieceSize / 2); // 繪製問號
      
      textSize(12);
      fill(203, 213, 225);
      text(`題 ${i + 1}`, p.homeX + pieceSize / 2, p.homeY + pieceSize - 15); // 格子編號
    } else if (!p.isDragging) {
      // 繪製非拖曳狀態下的已解鎖拼圖
      drawPieceImage(p, p.currentX, p.currentY, pieceSize);
    }
  }

  // 最後繪製正在被拖曳的拼圖 (保證畫在最上層)
  for (let i = 0; i < totalPieces; i++) {
    let p = pieces[i];
    if (p.unlocked && p.isDragging) {
      drawPieceImage(p, p.currentX, p.currentY, pieceSize);
    }
  }

  // 答題彈窗 (當狀態為 QUIZ 或 RESULT 時)
  if (quizState === 'QUIZ' || quizState === 'RESULT') {
    drawQuizModal();
  }
}

function drawPieceImage(p, x, y, size) {
  // 從裁切好的 sourceImg 中取出對應區域的圖案
  let sx = p.col * (sourceImg.width / 3); // 來源 X
  let sy = p.row * (sourceImg.height / 3); // 來源 Y
  let sw = sourceImg.width / 3; // 來源寬度
  let sh = sourceImg.height / 3; // 來源高度

  push(); // 儲存繪圖設定
  // 繪製剪裁圖像
  image(sourceImg, x, y, size, size, sx, sy, sw, sh);
  
  // 畫上邊框
  stroke(255, 255, 255, 150);
  strokeWeight(2);
  noFill();
  rect(x, y, size, size, 4);
  pop(); // 恢復繪圖設定
}

function drawQuizModal() {
  // 繪製遮罩
  fill(0, 0, 0, 200);
  rect(0, 0, width, height);

  // 彈窗背景板
  let modalW = min(550, width * 0.85); // 彈窗寬度
  let modalH = 380; // 彈窗高度
  let modalX = width / 2 - modalW / 2; // 彈窗 X
  let modalY = height / 2 - modalH / 2; // 彈窗 Y

  fill(30, 41, 59); // 彈窗背景
  stroke(99, 102, 241); // 紫藍色邊框
  strokeWeight(3);
  rect(modalX, modalY, modalW, modalH, 16); // 圓角外框

  let q = questions[activeQuestionIndex]; // 取得當前題目

  // 繪製題目內文
  fill(255);
  textSize(18);
  textAlign(LEFT, TOP);
  text(q.q, modalX + 30, modalY + 30, modalW - 60, 60);

  // 繪製三個選項按鈕
  for (let i = 0; i < 3; i++) {
    let btnX = modalX + 30;
    let btnY = modalY + 100 + i * 65;
    let btnW = modalW - 60;
    let btnH = 50;

    // 判斷按鈕懸停或選取狀態
    if (quizState === 'QUIZ') {
      if (mouseX > btnX && mouseX < btnX + btnW && mouseY > btnY && mouseY < btnY + btnH) {
        fill(79, 70, 229); // 懸停顏色
      } else {
        fill(51, 65, 85); // 一般顏色
      }
    } else if (quizState === 'RESULT') {
      if (i === q.answer) {
        fill(34, 197, 94); // 正確答案顯示綠色
      } else if (i === selectedOption) {
        fill(239, 68, 68); // 答錯的選項顯示紅色
      } else {
        fill(51, 65, 85); // 其他顯示灰色
      }
    }

    stroke(100, 116, 139);
    strokeWeight(1);
    rect(btnX, btnY, btnW, btnH, 8); // 按鈕框形

    // 按鈕文字
    fill(255);
    textSize(16);
    textAlign(LEFT, CENTER);
    text(q.options[i], btnX + 20, btnY + btnH / 2);
  }

  // 答題完成後的結果與指示區域
  if (quizState === 'RESULT') {
    textAlign(CENTER, CENTER);
    let p = pieces[activeQuestionIndex];
    if (p.isCorrect) {
      fill(74, 222, 128); // 答對提示綠字
      textSize(18);
      text("回答正確！已解鎖此拼圖塊", width / 2, modalY + modalH - 65);
    } else {
      fill(248, 113, 113); // 答錯提示紅字
      textSize(16);
      text(`答錯了！正確答案是：${q.options[q.answer]}`, width / 2, modalY + modalH - 65);
    }

    // 顯示按鈕：「去拼這塊拼圖」
    let nextBtnW = 180;
    let nextBtnH = 40;
    let nextBtnX = width / 2 - nextBtnW / 2;
    let nextBtnY = modalY + modalH - 45;

    fill(99, 102, 241);
    stroke(255);
    rect(nextBtnX, nextBtnY, nextBtnW, nextBtnH, 20); // 按鈕造型

    fill(255);
    textSize(15);
    text("去拼這塊拼圖", width / 2, nextBtnY + nextBtnH / 2); // 按鈕文字
  }
}

function mousePressed() {
  // 如果開啟了原圖彈窗，點擊任意處關閉彈窗
  if (showFullImageModal) {
    showFullImageModal = false;
    return;
  }

  // 結算畫面點擊處理
  if (quizState === 'FINISHED') {
    let btnW = 160;
    let btnH = 45;
    
    // 再玩一次按鈕
    let btn1X = width / 2 - btnW - 20;
    let btnY = height * 0.82;
    if (mouseX > btn1X && mouseX < btn1X + btnW && mouseY > btnY && mouseY < btnY + btnH) {
      initPieces(); // 重置遊戲
    }

    // 查看完整圖按鈕
    let btn2X = width / 2 + 20;
    if (mouseX > btn2X && mouseX < btn2X + btnW && mouseY > btnY && mouseY < btnY + btnH) {
      showFullImageModal = true; // 開啟彈窗
    }
    return;
  }

  // 答題狀態點擊處理
  if (quizState === 'QUIZ') {
    let modalW = min(550, width * 0.85);
    let modalH = 380;
    let modalX = width / 2 - modalW / 2;
    let modalY = height / 2 - modalH / 2;

    // 判斷點擊了哪一個選項
    for (let i = 0; i < 3; i++) {
      let btnX = modalX + 30;
      let btnY = modalY + 100 + i * 65;
      let btnW = modalW - 60;
      let btnH = 50;

      if (mouseX > btnX && mouseX < btnX + btnW && mouseY > btnY && mouseY < btnY + btnH) {
        selectedOption = i; // 紀錄選擇
        let p = pieces[activeQuestionIndex];
        p.unlocked = true; // 題解鎖拼圖
        
        if (i === questions[activeQuestionIndex].answer) {
          p.isCorrect = true; // 紀錄為正確
          score += 100 / totalPieces; // 計算分數
        } else {
          p.isCorrect = false; // 紀錄為錯誤
          wrongGrids.push(activeQuestionIndex + 1); // 紀錄答錯的格子編號
        }
        
        quizState = 'RESULT'; // 切換至單題結算狀態
        break;
      }
    }
    return;
  }

  // 單題結果狀態點擊「去拼這塊拼圖」
  if (quizState === 'RESULT') {
    let modalW = min(550, width * 0.85);
    let modalH = 380;
    let modalY = height / 2 - modalH / 2;
    let nextBtnW = 180;
    let nextBtnH = 40;
    let nextBtnX = width / 2 - nextBtnW / 2;
    let nextBtnY = modalY + modalH - 45;

    // 檢查點擊是否在按鈕上
    if (mouseX > nextBtnX && mouseX < nextBtnX + nextBtnW && mouseY > nextBtnY && mouseY < nextBtnY + nextBtnH) {
      quizState = 'GRID'; // 關閉彈窗，回到拼圖主畫面
      activeQuestionIndex = -1;
    }
    return;
  }

  // 主畫面：點擊鎖定方塊 / 拖曳拼圖塊
  if (quizState === 'GRID') {
    let boardSize = min(width * 0.38, height * 0.55);
    let pieceSize = boardSize / 3;

    // 先檢查是否點擊未解鎖的方塊
    for (let i = 0; i < totalPieces; i++) {
      let p = pieces[i];
      if (!p.unlocked) {
        if (mouseX > p.homeX && mouseX < p.homeX + pieceSize && mouseY > p.homeY && mouseY < p.homeY + pieceSize) {
          activeQuestionIndex = i; // 設定當前題目
          quizState = 'QUIZ'; // 開啟測驗
          return;
        }
      }
    }

    // 再檢查拖曳解鎖但未吸附的拼圖 (由上層往下層檢查)
    for (let i = totalPieces - 1; i >= 0; i--) {
      let p = pieces[i];
      if (p.unlocked && !p.placed) {
        if (mouseX > p.currentX && mouseX < p.currentX + pieceSize && mouseY > p.currentY && mouseY < p.currentY + pieceSize) {
          p.isDragging = true; // 開始拖曳
          p.dragOffsetX = mouseX - p.currentX; // 計算滑鼠與拼圖左上角偏移
          p.dragOffsetY = mouseY - p.currentY;
          break;
        }
      }
    }
  }
}

function mouseDragged() {
  // 更新正在拖曳拼圖的座標
  if (quizState === 'GRID') {
    for (let i = 0; i < totalPieces; i++) {
      let p = pieces[i];
      if (p.isDragging) {
        p.currentX = mouseX - p.dragOffsetX;
        p.currentY = mouseY - p.dragOffsetY;
      }
    }
  }
}

function mouseReleased() {
  // 放開滑鼠時檢查吸附邏輯
  if (quizState === 'GRID') {
    let boardSize = min(width * 0.38, height * 0.55);
    let pieceSize = boardSize / 3;

    for (let i = 0; i < totalPieces; i++) {
      let p = pieces[i];
      if (p.isDragging) {
        p.isDragging = false; // 結束拖曳
        
        // 計算當前位置與目標位置的距離
        let d = dist(p.currentX, p.currentY, p.targetX, p.targetY);
        
        // 若小於吸附閾值 (例如 40 像素)，則自動吸附
        if (d < 45) {
          p.currentX = p.targetX; // 設定位置為目標點
          p.currentY = p.targetY;
          p.placed = true; // 標記為已擺放正確
        }
      }
    }
    
    // 檢查是否全部 9 塊拼圖都已正確擺放
    checkAllPlaced();
  }
}

function checkAllPlaced() {
  // 檢查所有拼圖是否 placed 均為 true
  let allDone = pieces.every(p => p.placed);
  if (allDone) {
    quizState = 'FINISHED'; // 進入最終結算狀態
    timerEnd = millis(); // 記錄結束時間
    totalTime = round((timerEnd - timerStart) / 1000); // 計算總花費秒數
    
    // 計算最終四捨五入總分
    score = round(score);
    
    // 當成績高於 60% (>= 60 分)，觸發彩帶效果
    if (score >= 60) {
      createConfetti();
    }
  }
}

function drawFinishedState() {
  // 繪製背景與標題
  fill(255);
  textSize(32);
  text("🎉 恭喜完成 p5.js 拼圖挑戰！", width / 2, height * 0.12);

  let boardSize = min(width * 0.35, height * 0.5);
  let pieceSize = boardSize / 3;
  let boardStartX = width * 0.2 - boardSize / 2;
  let boardStartY = height * 0.48 - boardSize / 2;

  // 1. 左側顯示完整拼好的圖片
  stroke(255);
  strokeWeight(3);
  rect(boardStartX - 4, boardStartY - 4, boardSize + 8, boardSize + 8, 8);
  image(sourceImg, boardStartX, boardStartY, boardSize, boardSize);

  // 2. 右側顯示成績九宮格與詳細分數數據
  let panelX = width * 0.52;
  let panelY = height * 0.22;
  let panelW = width * 0.4;
  let panelH = height * 0.55;

  fill(30, 41, 59);
  stroke(71, 85, 105);
  strokeWeight(2);
  rect(panelX, panelY, panelW, panelH, 16);

  // 數據面板內容
  textAlign(LEFT, TOP);
  fill(255);
  textSize(22);
  text("📊 測驗成果報告", panelX + 30, panelY + 25);

  textSize(18);
  fill(226, 232, 240);
  text(`• 總得分： ${score} 分`, panelX + 30, panelY + 75);
  text(`• 花費時間： ${totalTime} 秒`, panelX + 30, panelY + 110);
  
  // 答錯格子提示
  let wrongText = wrongGrids.length > 0 ? wrongGrids.join(", ") + " 號" : "無 (全對！)";
  fill(wrongGrids.length > 0 ? color(248, 113, 113) : color(74, 222, 128));
  text(`• 答錯格子： ${wrongText}`, panelX + 30, panelY + 145);

  // 繪製右側小型的成績九宮格狀況圖
  textSize(16);
  fill(255);
  text("九宮格答題紀錄：", panelX + 30, panelY + 195);

  let miniGridSize = 40;
  let miniStartX = panelX + 30;
  let miniStartY = panelY + 230;

  for (let i = 0; i < 9; i++) {
    let r = floor(i / 3);
    let c = i % 3;
    let gx = miniStartX + c * (miniGridSize + 8);
    let gy = miniStartY + r * (miniGridSize + 8);

    if (pieces[i].isCorrect) {
      fill(34, 197, 94); // 綠色代表答對
    } else {
      fill(239, 68, 68); // 紅色代表答錯
    }
    stroke(255);
    strokeWeight(1);
    rect(gx, gy, miniGridSize, miniGridSize, 6);

    fill(255);
    textAlign(CENTER, CENTER);
    textSize(14);
    text(i + 1, gx + miniGridSize / 2, gy + miniGridSize / 2);
  }

  // 底部按鈕區
  textAlign(CENTER, CENTER);
  let btnW = 160;
  let btnH = 45;
  let btnY = height * 0.82;

  // 再玩一次按鈕
  let btn1X = width / 2 - btnW - 20;
  fill(99, 102, 241);
  stroke(255);
  rect(btn1X, btnY, btnW, btnH, 25);
  fill(255);
  textSize(16);
  text("🔄 再玩一次", btn1X + btnW / 2, btnY + btnH / 2);

  // 查看完整圖按鈕
  let btn2X = width / 2 + 20;
  fill(16, 185, 129);
  stroke(255);
  rect(btn2X, btnY, btnW, btnH, 25);
  fill(255);
  textSize(16);
  text("🔍 查看完整圖", btn2X + btnW / 2, btnY + btnH / 2);
}

function createConfetti() {
  // 建立 100 個彩帶粒子
  for (let i = 0; i < 120; i++) {
    confetti.push({
      x: random(width), // 隨機 X
      y: random(-height, 0), // 頂部外隨機 Y
      size: random(6, 12), // 隨機尺寸
      color: color(random(255), random(255), random(255)), // 隨機顏色
      speedY: random(2, 6), // 下落速度
      speedX: random(-2, 2) // 左右飄移速度
    });
  }
}

function updateAndDrawConfetti() {
  // 更新與畫出彩帶
  noStroke();
  for (let i = 0; i < confetti.length; i++) {
    let c = confetti[i];
    fill(c.color);
    rect(c.x, c.y, c.size, c.size * 1.5); // 繪製長方形彩帶
    c.y += c.speedY; // 位置下落
    c.x += c.speedX; // 位置飄移
    
    // 超出底部循環回頂部
    if (c.y > height) {
      c.y = -10;
      c.x = random(width);
    }
  }
}

function drawFullImageModal() {
  // 查看完整原圖的大圖彈窗
  fill(0, 0, 0, 230);
  rect(0, 0, width, height);

  let imgSize = min(width * 0.7, height * 0.7);
  let imgX = width / 2 - imgSize / 2;
  let imgY = height / 2 - imgSize / 2;

  // 繪製圖像外框與圖像本身
  stroke(255);
  strokeWeight(4);
  rect(imgX - 5, imgY - 5, imgSize + 10, imgSize + 10, 10);
  image(sourceImg, imgX, imgY, imgSize, imgSize);

  // 提示點擊關閉
  fill(255);
  noStroke();
  textSize(18);
  textAlign(CENTER, CENTER);
  text("（點擊畫面任意處關閉原圖）", width / 2, imgY + imgSize + 30);
}