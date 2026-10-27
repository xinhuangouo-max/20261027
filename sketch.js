// 交通安全圖片檔名。 // 設定圖片路徑
const IMAGE_PATH = "traffic_safety.jpg"; // 載入專案圖片
const PUZZLE_COUNT = 9; // 設定拼圖數量
const GRID_SIZE = 3; // 設定九宮格大小
const SNAP_RATIO = 0.65; // 設定自動吸附比例

// 儲存使用者圖片。 // 宣告圖片變數
let sourceImage = null; // 儲存載入的圖片
let imageLoaded = false; // 記錄圖片是否載入成功

// 儲存拼圖與遊戲資料。 // 宣告遊戲變數
let pieces = []; // 儲存九塊拼圖
let questions = []; // 儲存九道題目
let game = {}; // 儲存遊戲狀態
let layout = {}; // 儲存版面尺寸
let draggingPiece = null; // 儲存目前拖曳拼圖
let dragOffsetX = 0; // 儲存拖曳水平偏移
let dragOffsetY = 0; // 儲存拖曳垂直偏移
let showFullImage = false; // 記錄是否顯示完整圖片
let ribbons = []; // 儲存彩帶資料

// 預先載入使用者圖片。 // 載入圖片檔案
function preload() { // 開始預載入
  sourceImage = loadImage(IMAGE_PATH, imageLoadSuccess, imageLoadFail); // 載入交通安全圖片
} // 結束預載入

// 圖片載入成功時執行。 // 設定圖片載入狀態
function imageLoadSuccess() { // 開始成功處理
  imageLoaded = true; // 設定圖片載入成功
} // 結束成功處理

// 圖片載入失敗時執行。 // 使用程式繪製備援圖片
function imageLoadFail() { // 開始失敗處理
  imageLoaded = false; // 設定圖片載入失敗
} // 結束失敗處理

// p5.js 初始化函式。 // 建立遊戲畫面
function setup() { // 開始初始化
  createCanvas(windowWidth, windowHeight); // 建立全螢幕畫布
  textFont("Arial"); // 設定字型
  textAlign(CENTER, CENTER); // 設定文字置中
  questions = createQuestions(); // 建立題目資料
  resetGame(); // 初始化遊戲
  calculateLayout(); // 計算版面位置
  updateTrayPositions(); // 配置右側拼圖位置
} // 結束初始化

// p5.js 每幀繪圖函式。 // 負責繪製整個遊戲
function draw() { // 開始繪製畫面
  background("#edf5fb"); // 繪製背景顏色
  calculateLayout(); // 更新響應式版面
  updateTimer(); // 更新遊戲計時
  drawHeader(); // 繪製標題
  drawPuzzleBoard(); // 繪製左側拼圖板
  drawPuzzleTray(); // 繪製右側拼圖區
  drawInstruction(); // 繪製操作提示

  if (game.questionIndex !== -1) { // 判斷是否正在答題
    drawQuestionModal(); // 顯示題目視窗
  } else if (showFullImage) { // 判斷是否查看完整圖片
    drawFullImageModal(); // 顯示完整圖片視窗
  } else if (game.finished) { // 判斷是否完成遊戲
    drawResultPanel(); // 顯示結果面板
  } // 結束畫面狀態判斷

  if (game.finished && game.score / PUZZLE_COUNT > 0.6 && !showFullImage) { // 判斷成績是否高於百分之六十
    drawRibbons(); // 顯示彩帶效果
  } // 結束彩帶判斷
} // 結束每幀繪圖

// 建立九道交通安全題目。 // 回傳題目陣列
function createQuestions() { // 開始建立題目
  return [ // 回傳所有題目
    { title: "行人過馬路時，哪個號誌表示可以通行？", options: ["綠色行人燈", "紅色行人燈", "閃爍紅燈"], answer: 0 }, // 建立第一題
    { title: "p5.js 中哪個函式可以畫出圓形紅綠燈？", options: ["ellipse()", "rect()", "line()"], answer: 0 }, // 建立第二題
    { title: "騎乘機車或自行車時，應該戴什麼？", options: ["安全帽", "耳機", "拖鞋"], answer: 0 }, // 建立第三題
    { title: "乘坐汽車時，最重要的安全行為是什麼？", options: ["繫安全帶", "站在座位上", "把頭伸出窗外"], answer: 0 }, // 建立第四題
    { title: "p5.js 中 background() 可以用來做什麼？", options: ["設定背景色", "偵測車速", "播放聲音"], answer: 0 }, // 建立第五題
    { title: "通過路口前，正確的做法是什麼？", options: ["停看聽", "加速衝過去", "低頭看手機"], answer: 0 }, // 建立第六題
    { title: "p5.js 中 rect() 適合用來繪製什麼？", options: ["交通標誌", "音效", "滑鼠速度"], answer: 0 }, // 建立第七題
    { title: "夜間行走時，穿著什麼可以提高安全性？", options: ["反光衣物", "全黑衣服", "戴耳機"], answer: 0 }, // 建立第八題
    { title: "哪一種行為最容易造成交通事故？", options: ["酒後駕車", "遵守速限", "禮讓行人"], answer: 0 } // 建立第九題
  ]; // 結束題目陣列
} // 結束題目函式

// 重設整個遊戲。 // 清除上一局資料
function resetGame() { // 開始重設
  game = { questionIndex: -1, selectedOption: -1, submitted: false, score: 0, wrong: [], startTime: 0, elapsed: 0, finished: false }; // 建立遊戲狀態
  pieces = createPieces(); // 建立新的拼圖
  draggingPiece = null; // 清除拖曳狀態
  showFullImage = false; // 關閉完整圖片
  ribbons = []; // 清除彩帶
} // 結束重設

// 建立九塊拼圖資料。 // 設定正確位置與亂序位置
function createPieces() { // 開始建立拼圖
  const data = []; // 建立拼圖陣列
  const shuffledSlots = shuffle([...Array(PUZZLE_COUNT).keys()], true); // 打亂托盤槽位

  for (let index = 0; index < PUZZLE_COUNT; index++) { // 建立九塊拼圖
    const row = floor(index / GRID_SIZE); // 計算目標列
    const col = index % GRID_SIZE; // 計算目標欄

    data.push({ index: index, targetRow: row, targetCol: col, targetX: 0, targetY: 0, trayX: 0, trayY: 0, x: 0, y: 0, unlocked: false, placed: false, dragging: false, traySlot: shuffledSlots[index] }); // 儲存拼圖資料
  } // 結束拼圖迴圈

  return data; // 回傳拼圖資料
} // 結束建立拼圖

// 計算響應式版面。 // 設定拼圖板與托盤位置
function calculateLayout() { // 開始計算版面
  const mobile = width < 760; // 判斷是否為手機尺寸
  layout.mobile = mobile; // 儲存手機狀態
  layout.boardSize = mobile ? min(width * 0.78, height * 0.42) : min(width * 0.44, height * 0.55); // 設定拼圖板大小
  layout.cell = layout.boardSize / 3; // 設定拼圖單格大小
  layout.tile = layout.cell; // 讓托盤拼圖使用相同尺寸
  layout.boardX = mobile ? (width - layout.boardSize) / 2 : width * 0.05; // 設定拼圖板水平位置
  layout.boardY = mobile ? height * 0.16 : height * 0.19; // 設定拼圖板垂直位置
  layout.trayX = mobile ? width * 0.05 : width * 0.56; // 設定托盤水平位置
  layout.trayY = mobile ? height * 0.63 : height * 0.19; // 設定托盤垂直位置
  layout.trayW = mobile ? width * 0.9 : width * 0.39; // 設定托盤寬度
  layout.trayH = mobile ? height * 0.3 : height * 0.56; // 設定托盤高度
  layout.short = min(width, height); // 儲存畫布短邊
} // 結束版面計算

// 更新托盤位置。 // 只在初始化、重設或視窗變更時呼叫
function updateTrayPositions() { // 開始更新托盤
  const columns = layout.mobile ? 5 : 3; // 設定托盤欄數
  const gapX = layout.mobile ? layout.trayW / 5.2 : layout.trayW / 3.5; // 設定水平間距
  const gapY = layout.mobile ? layout.trayH / 2.1 : layout.trayH / 3.5; // 設定垂直間距

  for (const piece of pieces) { // 逐一配置拼圖
    const column = piece.traySlot % columns; // 計算托盤欄位
    const row = floor(piece.traySlot / columns); // 計算托盤列位

    piece.trayX = layout.trayX + layout.trayW * 0.08 + column * gapX; // 設定托盤水平位置
    piece.trayY = layout.trayY + 70 + row * gapY; // 設定托盤垂直位置

    if (!piece.placed && !piece.dragging) { // 判斷拼圖是否可同步
      piece.x = piece.trayX; // 設定拼圖目前水平位置
      piece.y = piece.trayY; // 設定拼圖目前垂直位置
    } // 結束位置同步
  } // 結束拼圖配置
} // 結束托盤位置

// 繪製標題區。 // 顯示遊戲名稱與進度
function drawHeader() { // 開始繪製標題
  fill("#17324d"); // 設定標題顏色
  noStroke(); // 移除外框
  textSize(layout.short * 0.035); // 設定標題大小
  text("交通安全凹凸拼圖測驗", width / 2, height * 0.055); // 顯示遊戲標題
  fill("#536d8a"); // 設定進度顏色
  textSize(layout.short * 0.018); // 設定進度大小
  const completed = pieces.filter(piece => piece.placed).length; // 計算完成數量
  text(`拼圖進度：${completed} / ${PUZZLE_COUNT}`, width / 2, height * 0.105); // 顯示拼圖進度
} // 結束標題

// 繪製左側拼圖板。 // 顯示目標位置
function drawPuzzleBoard() { // 開始繪製拼圖板
  fill("#d8e7f5"); // 設定拼圖板背景
  stroke("#7895b3"); // 設定拼圖板外框
  strokeWeight(3); // 設定外框粗細
  rect(layout.boardX, layout.boardY, layout.boardSize, layout.boardSize, 18); // 繪製拼圖板

  for (const piece of pieces) { // 逐一繪製拼圖格
    piece.targetX = layout.boardX + piece.targetCol * layout.cell; // 更新目標水平座標
    piece.targetY = layout.boardY + piece.targetRow * layout.cell; // 更新目標垂直座標

    if (piece.placed) { // 判斷拼圖是否已完成
      drawPuzzlePiece(piece, piece.targetX, piece.targetY); // 繪製完成拼圖
    } else { // 處理尚未完成的格子
      drawEmptyPuzzleSlot(piece, piece.targetX, piece.targetY); // 繪製空格
    } // 結束拼圖狀態判斷
  } // 結束拼圖格迴圈
} // 結束拼圖板

// 繪製拼圖空格。 // 顯示問號或解鎖提示
function drawEmptyPuzzleSlot(piece, x, y) { // 開始繪製空格
  fill("#f9fcff"); // 設定空格背景
  stroke("#a6b9cd"); // 設定空格外框
  strokeWeight(2); // 設定外框粗細
  rect(x, y, layout.cell, layout.cell); // 繪製矩形空格
  fill(piece.unlocked ? "#2f7197" : "#7890a8"); // 設定文字顏色
  noStroke(); // 移除文字外框
  textSize(layout.cell * 0.2); // 設定文字大小
  text(piece.unlocked ? "已解鎖" : "?", x + layout.cell / 2, y + layout.cell / 2); // 顯示狀態文字
} // 結束空格

// 繪製右側拼圖托盤。 // 顯示解鎖後可拖曳拼圖
function drawPuzzleTray() { // 開始繪製托盤
  fill("#ffffff"); // 設定托盤背景
  stroke("#aec2d8"); // 設定托盤外框
  strokeWeight(2); // 設定外框粗細
  rect(layout.trayX, layout.trayY, layout.trayW, layout.trayH, 18); // 繪製托盤

  fill("#17324d"); // 設定托盤標題顏色
  noStroke(); // 移除文字外框
  textSize(layout.short * 0.019); // 設定標題大小
  text("右側解鎖拼圖", layout.trayX + layout.trayW / 2, layout.trayY + 28); // 顯示托盤標題

  fill("#607890"); // 設定提示顏色
  textSize(layout.short * 0.014); // 設定提示大小
  text(draggingPiece ? "拖曳中" : "解鎖後請拖曳拼圖到左側", layout.trayX + layout.trayW / 2, layout.trayY + 52); // 顯示拖曳提示

  for (const piece of pieces) { // 逐一繪製拼圖
    if (piece.unlocked && !piece.placed) { // 判斷是否可顯示
      drawPuzzlePiece(piece, piece.x, piece.y); // 繪製解鎖拼圖
    } // 結束拼圖判斷
  } // 結束拼圖迴圈
} // 結束托盤

// 繪製拼圖本體。 // 使用圖片或備援圖案
function drawPuzzlePiece(piece, x, y) { // 開始繪製拼圖
  const size = layout.cell; // 使用統一拼圖尺寸

  push(); // 儲存繪圖狀態
  drawingContext.save(); // 儲存畫布裁切狀態
  drawingContext.beginPath(); // 開始裁切路徑
  createSimplePuzzlePath(x, y, size); // 建立凹凸輪廓
  drawingContext.clip(); // 套用凹凸裁切
  drawSourceArtwork(piece, x, y, size); // 繪製圖片內容
  drawingContext.restore(); // 還原裁切狀態
  noFill(); // 設定透明填色
  stroke(piece.dragging ? "#ff7a00" : "#ffffff"); // 設定拖曳或一般外框顏色
  strokeWeight(piece.dragging ? 4 : 2.5); // 設定外框粗細
  createSimplePuzzlePath(x, y, size); // 繪製凹凸外框
  pop(); // 還原繪圖狀態
} // 結束拼圖繪製

// 繪製圖片對應區塊。 // 確保拼圖可組回完整圖片
function drawSourceArtwork(piece, x, y, size) { // 開始繪製圖片
  if (imageLoaded && sourceImage) { // 判斷圖片是否成功載入
    const sourceSize = min(sourceImage.width, sourceImage.height); // 取得正方形圖片尺寸
    const sourceX = (sourceImage.width - sourceSize) / 2 + piece.targetCol * sourceSize / 3; // 計算圖片水平裁切位置
    const sourceY = (sourceImage.height - sourceSize) / 2 + piece.targetRow * sourceSize / 3; // 計算圖片垂直裁切位置
    image(sourceImage, x - piece.targetCol * size, y - piece.targetRow * size, sourceSize * 3 * size / sourceSize, sourceSize * 3 * size / sourceSize, sourceX - piece.targetCol * sourceSize / 3, sourceY - piece.targetRow * sourceSize / 3, sourceSize, sourceSize); // 繪製對應圖片
  } else { // 圖片失敗時
    drawTrafficFallback(x - piece.targetCol * size, y - piece.targetRow * size, size * 3); // 繪製交通安全備援圖
  } // 結束圖片判斷
} // 結束圖片函式

// 繪製交通安全備援圖。 // 圖片載入失敗時使用
function drawTrafficFallback(x, y, size) { // 開始繪製備援圖
  push(); // 儲存狀態
  translate(x, y); // 移動畫布原點
  fill("#bde0fe"); // 設定天空顏色
  noStroke(); // 移除外框
  rect(0, 0, size, size); // 繪製天空
  fill("#626d78"); // 設定道路顏色
  rect(0, size * 0.66, size, size * 0.34); // 繪製道路
  fill("#ffffff"); // 設定斑馬線顏色

  for (let index = 0; index < 6; index++) { // 繪製斑馬線
    rect(size * 0.3 + index * size * 0.09, size * 0.7, size * 0.04, size * 0.22); // 繪製斑馬線
  } // 結束斑馬線

  fill("#202b38"); // 設定號誌外框
  rect(size * 0.73, size * 0.15, size * 0.14, size * 0.42, 8); // 繪製紅綠燈
  fill("#e63946"); // 設定紅燈
  ellipse(size * 0.8, size * 0.24, size * 0.07, size * 0.07); // 繪製紅燈
  fill("#f1c453"); // 設定黃燈
  ellipse(size * 0.8, size * 0.37, size * 0.07, size * 0.07); // 繪製黃燈
  fill("#2a9d8f"); // 設定綠燈
  ellipse(size * 0.8, size * 0.5, size * 0.07, size * 0.07); // 繪製綠燈
  fill("#17324d"); // 設定文字顏色
  textSize(size * 0.1); // 設定文字大小
  text("停看聽", size * 0.25, size * 0.2); // 顯示安全標語
  pop(); // 還原狀態
} // 結束備援圖

// 建立簡化凹凸拼圖輪廓。 // 凹凸只負責外觀
function createSimplePuzzlePath(x, y, size) { // 開始建立輪廓
  beginShape(); // 開始形狀
  vertex(x, y); // 移動到左上角
  vertex(x + size * 0.35, y); // 繪製上方直線
  bezierVertex(x + size * 0.39, y - size * 0.13, x + size * 0.61, y - size * 0.13, x + size * 0.65, y); // 繪製上方凸起
  vertex(x + size, y); // 繪製上方右側
  vertex(x + size, y + size * 0.35); // 繪製右側直線
  bezierVertex(x + size * 1.13, y + size * 0.39, x + size * 1.13, y + size * 0.61, x + size, y + size * 0.65); // 繪製右側凸起
  vertex(x + size, y + size); // 繪製右下角
  vertex(x + size * 0.65, y + size); // 繪製下方直線
  bezierVertex(x + size * 0.61, y + size * 1.13, x + size * 0.39, y + size * 1.13, x + size * 0.35, y + size); // 繪製下方凹槽
  vertex(x, y + size); // 繪製左下角
  vertex(x, y + size * 0.65); // 繪製左側直線
  bezierVertex(x - size * 0.13, y + size * 0.61, x - size * 0.13, y + size * 0.39, x, y + size * 0.35); // 繪製左側凹槽
  endShape(CLOSE); // 關閉拼圖形狀
} // 結束拼圖輪廓

// 繪製題目視窗。 // 顯示交通安全題目
function drawQuestionModal() { // 開始題目視窗
  fill(0, 0, 0, 160); // 設定遮罩顏色
  rect(0, 0, width, height); // 繪製遮罩
  const box = getQuestionBox(); // 取得題目視窗
  const question = questions[game.questionIndex]; // 取得目前題目

  fill("#ffffff"); // 設定視窗背景
  stroke("#3d607e"); // 設定視窗外框
  strokeWeight(3); // 設定外框粗細
  rect(box.x, box.y, box.w, box.h, 20); // 繪製視窗

  fill("#17324d"); // 設定題目顏色
  noStroke(); // 移除文字外框
  textSize(layout.short * 0.021); // 設定題目大小
  text(`第 ${game.questionIndex + 1} 題：${question.title}`, box.x + box.w / 2, box.y + 38); // 顯示題目

  drawTrafficQuestionImage(box.x + box.w * 0.1, box.y + 70, box.w * 0.8, 120); // 繪製交通插圖
  drawAnswerDropZone(box.x + box.w * 0.1, box.y + 205, box.w * 0.8, 48); // 繪製答案投放區

  if (!game.submitted) { // 判斷是否尚未交卷
    for (let index = 0; index < 3; index++) { // 繪製三個選項
      const area = getOptionArea(index); // 取得選項位置
      fill(game.selectedOption === index ? "#b9e7f8" : "#f0f5fa"); // 設定選項背景
      stroke("#9eb2c5"); // 設定選項外框
      rect(area.x, area.y, area.w, area.h, 10); // 繪製選項
      fill("#17324d"); // 設定選項文字顏色
      noStroke(); // 移除文字外框
      textSize(layout.short * 0.016); // 設定文字大小
      text(`${index + 1}. ${question.options[index]}`, area.x + area.w / 2, area.y + area.h / 2); // 顯示選項文字
    } // 結束選項迴圈

    const submit = getQuestionButtons().submit; // 取得交卷按鈕
    drawButton("交卷看成績", submit.x, submit.y, submit.w, submit.h, "#247ba0"); // 繪製交卷按鈕
  } else { // 處理已交卷
    const correct = game.selectedOption === question.answer; // 判斷答案
    fill(correct ? "#168f55" : "#d94f4f"); // 設定結果顏色
    textSize(layout.short * 0.019); // 設定結果大小
    text(correct ? "答對了！拼圖已解鎖。" : `答錯了！正確答案是：${question.options[question.answer]}`, box.x + box.w / 2, box.y + 300); // 顯示結果

    const go = getQuestionButtons().go; // 取得去拼按鈕
    drawButton("去拼這塊拼圖", go.x, go.y, go.w, go.h, "#f28f3b"); // 繪製去拼按鈕
  } // 結束交卷狀態
} // 結束題目視窗

// 取得題目視窗尺寸。 // 計算題目位置
function getQuestionBox() { // 開始計算題目視窗
  const w = min(width * 0.86, 720); // 設定視窗寬度
  const h = min(height * 0.84, 620); // 設定視窗高度
  return { x: (width - w) / 2, y: (height - h) / 2, w: w, h: h }; // 回傳視窗資料
} // 結束題目視窗計算

// 取得選項位置。 // 計算答案框
function getOptionArea(index) { // 開始計算選項
  const box = getQuestionBox(); // 取得題目視窗
  return { x: box.x + box.w * 0.12, y: box.y + 275 + index * 55, w: box.w * 0.76, h: 42 }; // 回傳選項位置
} // 結束選項位置

// 取得題目按鈕位置。 // 計算交卷與去拼按鈕
function getQuestionButtons() { // 開始計算按鈕
  const box = getQuestionBox(); // 取得題目視窗
  return { submit: { x: box.x + box.w / 2 - 105, y: box.y + box.h - 52, w: 210, h: 38 }, go: { x: box.x + box.w / 2 - 115, y: box.y + box.h - 58, w: 230, h: 42 } }; // 回傳按鈕位置
} // 結束按鈕位置

// 繪製交通安全題目插圖。 // 顯示紅綠燈與斑馬線
function drawTrafficQuestionImage(x, y, w, h) { // 開始繪製插圖
  fill("#17324d"); // 設定插圖背景
  stroke("#5d7894"); // 設定插圖外框
  rect(x, y, w, h, 12); // 繪製插圖區域
  fill("#bde0fe"); // 設定天空
  noStroke(); // 移除天空外框
  rect(x + 8, y + 8, w - 16, h * 0.52); // 繪製天空
  fill("#59636e"); // 設定道路
  rect(x + 8, y + h * 0.54, w - 16, h * 0.38); // 繪製道路
  fill("#ffffff"); // 設定斑馬線顏色

  for (let index = 0; index < 5; index++) { // 繪製斑馬線
    rect(x + w * 0.3 + index * w * 0.07, y + h * 0.62, w * 0.03, h * 0.2); // 繪製斑馬線條
  } // 結束斑馬線

  fill("#202b38"); // 設定號誌外框
  rect(x + w * 0.78, y + h * 0.16, w * 0.1, h * 0.43, 6); // 繪製號誌
  fill("#e63946"); // 設定紅燈
  ellipse(x + w * 0.83, y + h * 0.25, h * 0.11, h * 0.11); // 繪製紅燈
  fill("#f1c453"); // 設定黃燈
  ellipse(x + w * 0.83, y + h * 0.38, h * 0.11, h * 0.11); // 繪製黃燈
  fill("#2a9d8f"); // 設定綠燈
  ellipse(x + w * 0.83, y + h * 0.51, h * 0.11, h * 0.11); // 繪製綠燈
  fill("#ffffff"); // 設定文字顏色
  noStroke(); // 移除文字外框
  textSize(h * 0.14); // 設定文字大小
  text("停看聽", x + w * 0.22, y + h * 0.25); // 顯示安全標語
} // 結束題目插圖

// 繪製答案投放區。 // 顯示答案放置位置
function drawAnswerDropZone(x, y, w, h) { // 開始繪製投放區
  fill("#fff8df"); // 設定投放區背景
  stroke("#d4a333"); // 設定投放區外框
  strokeWeight(2); // 設定外框粗細
  rect(x, y, w, h, 10); // 繪製投放區
  fill("#876b1d"); // 設定文字顏色
  noStroke(); // 移除外框
  textSize(layout.short * 0.016); // 設定提示文字大小
  const message = game.selectedOption === -1 ? "請將答案拖曳到圖片下方" : `已選答案：${questions[game.questionIndex].options[game.selectedOption]}`; // 建立提示文字
  text(message, x + w / 2, y + h / 2); // 顯示提示文字
} // 結束投放區

// 繪製通用按鈕。 // 統一按鈕樣式
function drawButton(label, x, y, w, h, colorValue) { // 開始繪製按鈕
  fill(colorValue); // 設定按鈕背景
  stroke("#ffffff"); // 設定按鈕外框
  strokeWeight(2); // 設定外框粗細
  rect(x, y, w, h, 10); // 繪製按鈕
  fill("#ffffff"); // 設定文字顏色
  noStroke(); // 移除文字外框
  textSize(layout.short * 0.016); // 設定文字大小
  text(label, x + w / 2, y + h / 2); // 顯示按鈕文字
} // 結束按鈕

// 繪製結果面板。 // 顯示成績與按鈕
function drawResultPanel() { // 開始繪製結果
  fill(0, 0, 0, 150); // 設定遮罩
  rect(0, 0, width, height); // 繪製遮罩
  const panel = getResultPanel(); // 取得結果面板

  fill("#ffffff"); // 設定面板背景
  stroke("#3d607e"); // 設定面板外框
  strokeWeight(3); // 設定外框粗細
  rect(panel.x, panel.y, panel.w, panel.h, 20); // 繪製面板

  fill("#17324d"); // 設定標題顏色
  noStroke(); // 移除文字外框
  textSize(layout.short * 0.027); // 設定標題大小
  text("拼圖完成！", panel.x + panel.w / 2, panel.y + 35); // 顯示完成標題

  const percentage = round(game.score / PUZZLE_COUNT * 100); // 計算分數百分比
  fill("#315a7d"); // 設定成績顏色
  textSize(layout.short * 0.017); // 設定文字大小
  text(`成績：${percentage}%（${game.score} / ${PUZZLE_COUNT}）`, panel.x + panel.w / 2, panel.y + 70); // 顯示成績
  text(`錯誤格子：${game.wrong.length ? game.wrong.map(index => index + 1).join("、") : "無"}`, panel.x + panel.w / 2, panel.y + 98); // 顯示錯誤格子
  text(`花費時間：${formatTime(game.elapsed)}`, panel.x + panel.w / 2, panel.y + 126); // 顯示花費時間

  const gridSize = min(panel.w * 0.36, 180); // 設定成績九宮格大小
  const gridX = panel.x + (panel.w - gridSize) / 2; // 計算九宮格水平位置
  const gridY = panel.y + 150; // 設定九宮格垂直位置
  const cell = gridSize / 3; // 設定九宮格單格大小

  for (let index = 0; index < PUZZLE_COUNT; index++) { // 繪製九格成績
    const column = index % 3; // 計算成績欄位
    const row = floor(index / 3); // 計算成績列位
    fill(game.wrong.includes(index) ? "#f1a3a3" : "#91ddb1"); // 設定正誤顏色
    stroke("#ffffff"); // 設定格子外框
    rect(gridX + column * cell, gridY + row * cell, cell, cell); // 繪製成績格
    fill("#17324d"); // 設定符號顏色
    noStroke(); // 移除符號外框
    textSize(cell * 0.28); // 設定符號大小
    text(game.wrong.includes(index) ? "✕" : "✓", gridX + column * cell + cell / 2, gridY + row * cell + cell / 2); // 顯示正誤
  } // 結束成績九宮格

  const buttons = getResultButtons(); // 取得結果按鈕
  drawButton("再玩一次", buttons.restart.x, buttons.restart.y, buttons.restart.w, buttons.restart.h, "#247ba0"); // 繪製再玩一次
  drawButton("查看完整圖片", buttons.full.x, buttons.full.y, buttons.full.w, buttons.full.h, "#f28f3b"); // 繪製完整圖片
} // 結束結果面板

// 計算結果面板位置。 // 回傳面板矩形
function getResultPanel() { // 開始計算面板
  const w = min(width * 0.84, 680); // 設定面板寬度
  const h = min(height * 0.8, 540); // 設定面板高度
  return { x: (width - w) / 2, y: (height - h) / 2, w: w, h: h }; // 回傳面板資料
} // 結束面板計算

// 計算結果按鈕位置。 // 回傳兩個按鈕
function getResultButtons() { // 開始計算按鈕
  const panel = getResultPanel(); // 取得面板資料
  return { restart: { x: panel.x + panel.w * 0.16, y: panel.y + panel.h - 52, w: panel.w * 0.3, h: 38 }, full: { x: panel.x + panel.w * 0.54, y: panel.y + panel.h - 52, w: panel.w * 0.32, h: 38 } }; // 回傳按鈕資料
} // 結束按鈕計算

// 繪製完整圖片視窗。 // 顯示原始完整圖片
function drawFullImageModal() { // 開始繪製完整圖片
  fill(0, 0, 0, 190); // 設定遮罩
  rect(0, 0, width, height); // 繪製遮罩
  const area = getFullImageArea(); // 取得完整圖片區域

  fill("#ffffff"); // 設定卡片背景
  rect(area.card.x, area.card.y, area.card.w, area.card.h, 18); // 繪製卡片

  if (imageLoaded && sourceImage) { // 判斷是否有原始圖片
    image(sourceImage, area.image.x, area.image.y, area.image.w, area.image.h); // 顯示完整圖片
  } else { // 圖片失敗時
    drawTrafficFallback(area.image.x, area.image.y, area.image.w); // 顯示交通安全備援圖
  } // 結束圖片判斷

  drawButton("關閉", area.close.x, area.close.y, area.close.w, area.close.h, "#536d8a"); // 繪製關閉按鈕
} // 結束完整圖片

// 計算完整圖片區域。 // 回傳圖片與關閉按鈕
function getFullImageArea() { // 開始計算區域
  const size = min(width * 0.7, height * 0.68); // 設定圖片大小
  const x = (width - size) / 2; // 設定圖片水平位置
  const y = (height - size) / 2 - 15; // 設定圖片垂直位置
  return { image: { x: x, y: y, w: size, h: size }, card: { x: x - 18, y: y - 45, w: size + 36, h: size + 100 }, close: { x: x + size / 2 - 60, y: y + size + 15, w: 120, h: 38 } }; // 回傳區域資料
} // 結束區域計算

// 繪製操作提示。 // 告知玩家如何操作
function drawInstruction() { // 開始繪製提示
  fill("#526a82"); // 設定提示顏色
  noStroke(); // 移除外框
  textSize(layout.short * 0.015); // 設定提示大小
  text("點擊問號答題，解鎖後拖曳右側拼圖到左側正確位置。", width / 2, height - 22); // 顯示操作提示
} // 結束操作提示

// 格式化時間。 // 將毫秒轉成分秒
function formatTime(milliseconds) { // 開始格式化時間
  const totalSeconds = floor(milliseconds / 1000); // 計算總秒數
  const minutes = floor(totalSeconds / 60); // 計算分鐘
  const seconds = totalSeconds % 60; // 計算剩餘秒數
  return `${nf(minutes, 2)}:${nf(seconds, 2)}`; // 回傳時間文字
} // 結束格式化時間

// 更新計時器。 // 計算遊戲經過時間
function updateTimer() { // 開始更新時間
  if (game.startTime > 0 && !game.finished) { // 判斷是否正在遊戲
    game.elapsed = millis() - game.startTime; // 更新經過時間
  } // 結束計時判斷
} // 結束更新計時

// 繪製彩帶動畫。 // 成績高於百分之六十時使用
function drawRibbons() { // 開始繪製彩帶
  if (ribbons.length === 0) { // 判斷是否尚未建立彩帶
    for (let index = 0; index < 90; index++) { // 建立九十條彩帶
      ribbons.push({ x: random(width), y: random(-height, 0), speed: random(2, 6), size: random(6, 14), angle: random(TWO_PI), spin: random(-0.08, 0.08), color: color(random(255), random(255), random(255)) }); // 儲存彩帶資料
    } // 結束彩帶建立
  } // 結束彩帶初始化

  for (const ribbon of ribbons) { // 逐一更新彩帶
    ribbon.y += ribbon.speed; // 更新垂直位置
    ribbon.angle += ribbon.spin; // 更新旋轉角度

    if (ribbon.y > height + 20) { // 判斷彩帶是否離開畫面
      ribbon.y = random(-height, -20); // 將彩帶放回上方
      ribbon.x = random(width); // 重新設定水平位置
    } // 結束彩帶重設

    push(); // 儲存繪圖狀態
    translate(ribbon.x, ribbon.y); // 移動彩帶位置
    rotate(ribbon.angle); // 旋轉彩帶
    fill(ribbon.color); // 設定彩帶顏色
    noStroke(); // 移除彩帶外框
    rect(0, 0, ribbon.size, ribbon.size * 2.5); // 繪製彩帶
    pop(); // 還原繪圖狀態
  } // 結束彩帶繪製
} // 結束彩帶

// 判斷座標是否在矩形內。 // 提供碰撞判斷
function pointInRect(px, py, x, y, w, h) { // 開始判斷
  return px >= x && px <= x + w && py >= y && py <= y + h; // 回傳結果
} // 結束判斷

// 啟動遊戲計時。 // 第一次操作時開始計時
function startTimer() { // 開始啟動計時
  if (game.startTime === 0) { // 判斷是否尚未開始
    game.startTime = millis(); // 記錄開始時間
  } // 結束開始判斷
} // 結束啟動計時

// 處理滑鼠按下。 // 呼叫統一輸入函式
function mousePressed() { // 開始滑鼠按下
  pointerPressed(mouseX, mouseY); // 處理滑鼠座標
  return false; // 防止預設行為
} // 結束滑鼠按下

// 統一處理按下事件。 // 依優先順序處理所有操作
function pointerPressed(px, py) { // 開始按下處理
  startTimer(); // 啟動計時

  if (game.questionIndex !== -1) { // 題目視窗優先
    handleQuestionPress(px, py); // 處理題目操作
    return; // 結束題目操作
  } // 結束題目判斷

  if (showFullImage) { // 完整圖片視窗第二優先
    const area = getFullImageArea(); // 取得完整圖片區域
    if (pointInRect(px, py, area.close.x, area.close.y, area.close.w, area.close.h)) { // 判斷是否點擊關閉
      showFullImage = false; // 關閉完整圖片
    } // 結束關閉判斷
    return; // 結束完整圖片操作
  } // 結束完整圖片判斷

  if (game.finished) { // 結果面板第三優先
    handleResultPress(px, py); // 處理結果按鈕
    return; // 結束結果操作
  } // 結束完成判斷

  for (let index = pieces.length - 1; index >= 0; index--) { // 從上層開始檢查拼圖
    const piece = pieces[index]; // 取得目前拼圖

    if (!piece.unlocked || piece.placed) { // 判斷拼圖是否可拖曳
      continue; // 跳過不可拖曳拼圖
    } // 結束可拖曳判斷

    if (pointInRect(px, py, piece.x, piece.y, layout.cell, layout.cell)) { // 使用矩形碰撞判斷
      draggingPiece = piece; // 設定目前拖曳拼圖
      piece.dragging = true; // 設定拼圖正在拖曳
      dragOffsetX = px - piece.x; // 記錄水平偏移
      dragOffsetY = py - piece.y; // 記錄垂直偏移
      return; // 結束拼圖選取
    } // 結束碰撞判斷
  } // 結束拼圖檢查

  for (const piece of pieces) { // 檢查左側問號格
    if (!piece.unlocked && pointInRect(px, py, piece.targetX, piece.targetY, layout.cell, layout.cell)) { // 判斷是否點擊問號
      game.questionIndex = piece.index; // 開啟對應題目
      game.selectedOption = -1; // 清除答案
      game.submitted = false; // 設定尚未交卷
      return; // 結束問號操作
    } // 結束問號判斷
  } // 結束問號檢查
} // 結束按下處理

// 處理題目按下事件。 // 選擇答案或交卷
function handleQuestionPress(px, py) { // 開始處理題目
  const question = questions[game.questionIndex]; // 取得目前題目

  if (!game.submitted) { // 判斷是否尚未交卷
    for (let index = 0; index < 3; index++) { // 檢查三個選項
      const area = getOptionArea(index); // 取得選項區域

      if (pointInRect(px, py, area.x, area.y, area.w, area.h)) { // 判斷是否點擊答案
        game.selectedOption = index; // 設定答案
        return; // 結束答案選擇
      } // 結束答案判斷
    } // 結束選項檢查

    const submit = getQuestionButtons().submit; // 取得交卷按鈕

    if (pointInRect(px, py, submit.x, submit.y, submit.w, submit.h) && game.selectedOption !== -1) { // 判斷是否點擊交卷
      submitAnswer(); // 提交答案
      return; // 結束交卷處理
    } // 結束交卷判斷
  } else { // 處理已交卷狀態
    const go = getQuestionButtons().go; // 取得去拼按鈕

    if (pointInRect(px, py, go.x, go.y, go.w, go.h)) { // 判斷是否點擊去拼
      unlockCurrentPiece(); // 解鎖拼圖
      game.questionIndex = -1; // 關閉題目視窗
    } // 結束去拼判斷
  } // 結束交卷狀態
} // 結束題目處理

// 提交答案。 // 交卷後才判分
function submitAnswer() { // 開始提交答案
  const index = game.questionIndex; // 取得題目索引
  const correct = game.selectedOption === questions[index].answer; // 判斷答案正確性
  game.submitted = true; // 設定已交卷

  if (correct) { // 判斷答對
    game.score++; // 增加分數
  } else if (!game.wrong.includes(index)) { // 判斷答錯
    game.wrong.push(index); // 記錄錯誤格子
  } // 結束判分
} // 結束答案提交

// 解鎖目前拼圖。 // 答題後立即顯示到右側
function unlockCurrentPiece() { // 開始解鎖拼圖
  const piece = pieces.find(item => item.index === game.questionIndex); // 找到目前拼圖

  if (!piece) { // 判斷是否找不到拼圖
    return; // 找不到時結束
  } // 結束找不到判斷

  updateTrayPositions(); // 確保托盤位置正確
  piece.unlocked = true; // 設定拼圖解鎖
  piece.placed = false; // 設定拼圖尚未放置
  piece.dragging = false; // 設定拼圖沒有拖曳
  piece.x = piece.trayX; // 設定右側水平位置
  piece.y = piece.trayY; // 設定右側垂直位置
} // 結束解鎖

// 處理滑鼠拖曳。 // 更新拼圖位置
function mouseDragged() { // 開始滑鼠拖曳
  pointerDragged(mouseX, mouseY); // 呼叫統一拖曳
  return false; // 防止預設行為
} // 結束滑鼠拖曳

// 更新拖曳拼圖。 // 讓拼圖跟著滑鼠移動
function pointerDragged(px, py) { // 開始拖曳更新
  if (!draggingPiece) { // 判斷是否沒有拖曳拼圖
    return; // 沒有拖曳時結束
  } // 結束沒有拖曳判斷

  draggingPiece.x = px - dragOffsetX; // 更新拼圖水平位置
  draggingPiece.y = py - dragOffsetY; // 更新拼圖垂直位置
} // 結束拖曳更新

// 處理滑鼠放開。 // 判斷是否自動吸附
function mouseReleased() { // 開始滑鼠放開
  pointerReleased(mouseX, mouseY); // 呼叫統一放開函式
  return false; // 防止預設行為
} // 結束滑鼠放開

// 處理拼圖放開與吸附。 // 使用左上角差值避免尺寸誤差
function pointerReleased(px, py) { // 開始放開處理
  if (!draggingPiece) { // 判斷是否沒有拖曳拼圖
    return; // 沒有拖曳時結束
  } // 結束沒有拖曳判斷

  const piece = draggingPiece; // 儲存目前拼圖
  const horizontalDistance = abs(piece.x - piece.targetX); // 計算水平距離
  const verticalDistance = abs(piece.y - piece.targetY); // 計算垂直距離
  const snapDistance = layout.cell * SNAP_RATIO; // 設定吸附距離

  if (horizontalDistance <= snapDistance && verticalDistance <= snapDistance) { // 判斷是否接近目標位置
    piece.x = piece.targetX; // 吸附到正確水平位置
    piece.y = piece.targetY; // 吸附到正確垂直位置
    piece.placed = true; // 設定拼圖完成
    piece.dragging = false; // 結束拼圖拖曳
    draggingPiece = null; // 清除拖曳物件
    checkFinished(); // 檢查是否完成
    return; // 結束吸附處理
  } // 結束吸附判斷

  piece.x = piece.trayX; // 放錯時回到右側水平位置
  piece.y = piece.trayY; // 放錯時回到右側垂直位置
  piece.dragging = false; // 結束拼圖拖曳
  draggingPiece = null; // 清除拖曳物件
} // 結束放開處理

// 檢查拼圖是否全部完成。 // 完成後顯示結果
function checkFinished() { // 開始檢查完成
  if (pieces.every(piece => piece.placed)) { // 判斷九塊拼圖是否完成
    game.finished = true; // 設定遊戲完成
    game.elapsed = millis() - game.startTime; // 記錄完成時間
  } // 結束完成判斷
} // 結束完成檢查

// 處理結果按鈕。 // 管理重新開始與完整圖片
function handleResultPress(px, py) { // 開始處理結果
  const buttons = getResultButtons(); // 取得結果按鈕

  if (pointInRect(px, py, buttons.restart.x, buttons.restart.y, buttons.restart.w, buttons.restart.h)) { // 判斷是否點擊再玩一次
    resetGame(); // 重設遊戲
    calculateLayout(); // 重新計算版面
    updateTrayPositions(); // 重新配置托盤
    return; // 結束重新開始
  } // 結束再玩一次判斷

  if (pointInRect(px, py, buttons.full.x, buttons.full.y, buttons.full.w, buttons.full.h)) { // 判斷是否點擊完整圖片
    showFullImage = true; // 顯示完整圖片
  } // 結束完整圖片判斷
} // 結束結果處理

// 處理視窗變更。 // 保留遊戲狀態
function windowResized() { // 開始視窗變更
  resizeCanvas(windowWidth, windowHeight); // 調整畫布尺寸
  calculateLayout(); // 重新計算版面
  updateTrayPositions(); // 更新托盤位置
} // 結束視窗變更

// 處理觸控開始。 // 支援手機操作
function touchStarted() { // 開始觸控
  if (touches.length > 0) { // 判斷是否有觸控點
    pointerPressed(touches[0].x, touches[0].y); // 處理觸控按下
  } // 結束觸控判斷
  return false; // 防止頁面捲動
} // 結束觸控開始

// 處理觸控移動。 // 支援手機拖曳
function touchMoved() { // 開始觸控移動
  if (touches.length > 0) { // 判斷是否有觸控點
    pointerDragged(touches[0].x, touches[0].y); // 處理觸控拖曳
  } // 結束觸控判斷
  return false; // 防止頁面捲動
} // 結束觸控移動

// 處理觸控結束。 // 支援手機放開
function touchEnded() { // 開始觸控結束
  if (touches.length > 0) { // 判斷是否仍有觸控點
    pointerReleased(touches[0].x, touches[0].y); // 使用觸控座標放開
  } else { // 沒有觸控點時
    pointerReleased(mouseX, mouseY); // 使用滑鼠座標放開
  } // 結束觸控判斷
  return false; // 防止手機預設行為
} // 結束觸控結束