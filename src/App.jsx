// 網站建立自楊家驊老師 The website was created by Teacher ChiahuaYang
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { 
  Clipboard, Upload, Loader2, BarChart3, 
  ShieldCheck, Eye, Edit3, Check, Scale, 
  AlertCircle, X, Info, BookOpen, ChevronRight, 
  MessageSquare, Layers, Target, Activity, ScanLine, Calculator,
  MousePointer2, Ruler, Crosshair, FunctionSquare, Printer, Sparkles, Lightbulb, Heart, Brain, Zap, Globe, Leaf,
  CheckCircle, Sun, Smile, FileText, Users, History, Trash2
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';

// --- 常數與配置 ---
const SUBJECTS = ['國語', '數學', '社會', '英文', '自然'];
const API_KEY = ""; // 執行環境會自動提供
const MODEL_NAME = "gemini-2.5-flash-preview-09-2025";

// --- 專家建議資料庫 ---
const SUBJECT_ADVICE = {
  '國語': {
    icon: <BookOpen size={16} />,
    title: '閱讀與思維',
    leading: [
      "你對文字的敏感度很高，可以多接觸不同背景的文學作品，練習體會文字背後的弦外之音。",
      "嘗試將閱讀後的感想與生活連結，這能幫助你將零散的思緒整理成更有系統的觀點。",
      "在閱讀長篇文章後，練習提取幾個關鍵概念，這對掌握複雜文本非常有幫助。"
    ],
    improving: [
      "建議透過『大聲朗讀』來感受課文的語氣與節奏，這對於建立語感很有幫助。",
      "可以試著將課文中的優美詞彙應用在平日的簡短紀錄中，這會讓這些文字真正變成你的。",
      "先從自己感興趣的故事主題開始讀起，累積對文字的親近感，閱讀會變得越來越輕鬆。"
    ]
  },
  '數學': {
    icon: <Brain size={16} />,
    title: '邏輯與策略',
    leading: [
      "你展現了優秀的思維，可以試著探索公式背後的由來，理解原理會讓應用更靈活。",
      "練習看看『一題多解』，從不同的路徑切入問題，能讓你的思維死角越來越少。",
      "試著把學過的邏輯教給別人看，當你能講得通時，就代表你已經內化了這個概念。"
    ],
    improving: [
      "學習數學像是堆積木，先把課本裡的基礎定義弄清楚，基礎穩了，解題就會有成就感。",
      "不需要急著寫很難的題目，先把基本例題反覆練習幾次，確保運算的流程是流暢的。",
      "遇到卡住的題目時，可以換個心情再回頭看，或者試著畫出圖表來幫助大腦思考。"
    ]
  },
  '社會': {
    icon: <Globe size={16} />,
    title: '觀察與脈絡',
    leading: [
      "你很擅長整理資訊，可以練習將不同時間的事件串聯起來，看見歷史或地理背後的因果。",
      "關注一下最近的新聞時事，並思考課本內容在現實中是如何運作的，這能讓知識變得很立體。",
      "試著從不同的社會角色來看同一件事，這能幫助你培養更全面、更具深度的思辨力。"
    ],
    improving: [
      "社會科其實是許多精彩故事的集合。想像自己是當時的人，這能幫你理解為何會有那樣的發展。",
      "對於複雜的資訊，可以試著用畫圖或拉時間軸的方式呈現，讓文字敘述變成圖像記憶。",
      "可以從你喜歡的地圖、圖表或特定人物故事開始讀起，興趣是理解學科最好的動力。"
    ]
  },
  '英文': {
    icon: <MessageSquare size={16} />,
    title: '感知與沉浸',
    leading: [
      "你的語感表現優異，可以開始接觸課外的英文讀物或短片，挑戰更自然的語言環境。",
      "練習聽不同背景的英文資源，這能提升你在真實生活情境中的聽力適應能力。",
      "試著用英文寫下簡短的計畫或心情，讓語言成為你生活中自然的一部分。"
    ],
    improving: [
      "英文需要時間來讓耳朵習慣。每天花幾分鐘聽聽朗讀，即便沒聽懂全部，也是在累積感度。",
      "每天掌握幾個對你有意義、用得到的單字，積少成多會產生非常驚人的進步。",
      "不要怕犯錯，試著勇敢讀出聲來。語言是溝通的橋樑，只要敢開口就是跨出了一大步。"
    ]
  },
  '自然': {
    icon: <Leaf size={16} />,
    title: '好奇與探究',
    leading: [
      "你擁有敏銳的觀察力。對於生活中的現象，試著用科學的視角去推論它發生的原因。",
      "可以閱讀一些科普短文或新聞，探索前瞻的科學發展，這會大大擴展你的科學視野。",
      "針對實驗結果，試著提出『如果改變某個條件會怎樣？』的假設，這是科學探究的靈魂。"
    ],
    improving: [
      "科學其實就在你的生活週遭。觀察植物生長或廚房裡的物理現象，你會發現原理很親切。",
      "試著將課本上的圖表與生活現象對照，找回對世界運作的好奇心，學習會更有動力。",
      "先從記錄你觀察到的細節開始。當你開始好奇『這是在做什麼？』時，你就跨出了第一步。"
    ]
  }
};

const App = () => {
  // --- 狀態管理 ---
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('grade_history');
    return saved ? JSON.parse(saved) : [];
  });
  const [testName, setTestName] = useState('');
  const [showSavePrompt, setShowSavePrompt] = useState(false);

  useEffect(() => {
    localStorage.setItem('grade_history', JSON.stringify(history));
  }, [history]);

  const [subjectData, setSubjectData] = useState(
    SUBJECTS.reduce((acc, sub) => ({
      ...acc,
      [sub]: { 
        score: 0, 
        average: 0,
        min: 0,
        q1: 0,
        median: 0,
        q3: 0,
        max: 100, // Default max
        visualZone: '待分析', 
        calibrationStatus: 'pending',
        debugInfo: '' 
      }
    }), {})
  );

  const [tempData, setTempData] = useState(null);
  const [showIntroModal, setShowIntroModal] = useState(true);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null); 
  const [isDragging, setIsDragging] = useState(false);
  
  const reportSectionRef = useRef(null);

  // --- 核心診斷邏輯 (教育顧問引擎) ---
  const currentAnalysis = useMemo(() => {
    const results = {};
    
    // 定義預設樣式
    const defaultCardStyle = {
      border: "border-slate-200",
      bg: "bg-white",
      sidebar: "bg-slate-50",
      iconColor: "text-slate-400",
      titleColor: "text-slate-800",
      highlight: "text-slate-600"
    };

    Object.keys(subjectData).forEach(sub => {
      const { score, average, q1, median, q3, visualZone, difficultyType } = subjectData[sub];

      // 計算 IQR
      const iqr = (q3 && q1) ? (q3 - q1) : 0;

      // 1. 班級生態分析
      let classContext = "";
      if (iqr > 0) {
        if (iqr <= 10) classContext = "競爭白熱化 (高度集中)";
        else if (iqr <= 25) classContext = "常態分佈 (層次分明)";
        else classContext = "程度M型化 (落差極大)";
      } else {
        classContext = "待數據讀取";
      }

      // 2. 考卷難度分析
      const anchorValue = median || ((q1+q3)/2) || average;
      let difficultyLabel = "";
      let difficultyContext = "";
      
      if (difficultyType === 'easy' || anchorValue >= 85) {
        difficultyLabel = "考卷偏易";
        difficultyContext = "測驗內容基礎，高分群擁擠。";
      } else if (difficultyType === 'hard' || anchorValue < 65) {
        difficultyLabel = "考卷偏難";
        difficultyContext = "測驗具高挑戰性，考驗深度理解。";
      } else {
        difficultyLabel = "難度適中";
        difficultyContext = "鑑別度良好，能反映真實實力。";
      }

      // 3. 個人表現與建議矩陣
      let zoneType = ""; 
      let personalStatus = "";
      let personalDesc = "";
      let zoneColor = "";
      let cardStyle = { ...defaultCardStyle };

      // 判斷落點區間
      let determinedZone = visualZone; 
      if (score > 0 && q1 > 0 && q3 > 0 && median > 0) {
          if (score > q3) determinedZone = '精熟';
          else if (score > median && score <= q3) determinedZone = '穩健';
          else if (score >= q1 && score <= median) determinedZone = '努力';
          else if (score < q1) determinedZone = '開發';
      }

      switch (determinedZone) {
        case '精熟': 
          zoneType = 'leading';
          personalStatus = "精熟表現區間";
          personalDesc = "你在全班的前 25% 的同學，考試成績非常優異，繼續努力才能繼續保持！";
          zoneColor = "text-emerald-600";
          cardStyle = { border: "border-emerald-500", bg: "bg-white", sidebar: "bg-emerald-50/50", iconColor: "text-emerald-500", titleColor: "text-emerald-900", highlight: "text-emerald-600" };
          break;
          
        case '穩健': 
          zoneType = 'leading';
          personalStatus = "穩健發揮區間";
          personalDesc = "你在班上的成績在中段區間，持續努力穩健的學習，下次說不定就會有大大的進步。";
          zoneColor = "text-blue-600";
          cardStyle = { border: "border-blue-500", bg: "bg-white", sidebar: "bg-blue-50/50", iconColor: "text-blue-500", titleColor: "text-blue-900", highlight: "text-blue-600" };
          break;

        case '努力': 
          zoneType = 'improving';
          personalStatus = "努力成長區間";
          personalDesc = "你在這次的成績在中段區間，繼續努力試著穩定向前進。";
          zoneColor = "text-amber-600";
          cardStyle = { border: "border-amber-500", bg: "bg-white", sidebar: "bg-amber-50/50", iconColor: "text-amber-500", titleColor: "text-amber-900", highlight: "text-amber-600" };
          break;

        case '開發': 
          zoneType = 'improving';
          personalStatus = "開發潛力區間";
          personalDesc = "你擁有很大的成長空間，相信你持續的努力會往前進步的。";
          zoneColor = "text-rose-600";
          cardStyle = { border: "border-rose-500", bg: "bg-white", sidebar: "bg-rose-50/50", iconColor: "text-rose-500", titleColor: "text-rose-900", highlight: "text-rose-600" };
          break;

        default: 
          zoneType = 'improving';
          personalStatus = "待分析";
          personalDesc = "請上傳成績單圖片以獲取分析與建議。";
          zoneColor = "text-slate-400";
          cardStyle = defaultCardStyle;
      }

      // 4. 獲取學科建議
      let zoneTypeKey = '';
      if (determinedZone === '精熟' || determinedZone === '穩健') zoneTypeKey = 'leading';
      else if (determinedZone === '努力' || determinedZone === '開發') zoneTypeKey = 'improving';

      const adviceData = SUBJECT_ADVICE[sub];
      // 確保 fullAdviceList 始終為陣列且不為空
      const fullAdviceList = (adviceData && zoneTypeKey && adviceData[zoneTypeKey] && adviceData[zoneTypeKey].length > 0) 
                             ? adviceData[zoneTypeKey] 
                             : ["請繼續保持學習熱忱，穩紮穩打。"];
      
      const seed = (sub.charCodeAt(0) + Math.floor(score)) % fullAdviceList.length;
      const selectedAdvice = fullAdviceList[seed] || fullAdviceList[0];

      const subjectInfo = adviceData || { title: '綜合學科', icon: <BookOpen size={16} /> };

      results[sub] = { 
        classContext,
        difficultyContext,
        personalStatus,
        personalDesc,
        cardStyle,
        zoneColor,
        selectedAdvice,
        subjectInfo,
        // IQR 狀態描述 (手冊定義)
        dispersionDesc: iqr <= 12 ? "分佈集中：競爭激烈，「細心度」是關鍵。" 
                      : iqr <= 25 ? "分佈適中：按部就班努力，成績可穩步提升。" 
                      : "分佈分散：程度落差大，「與自己比較」更有意義。",
        // 難度描述 (手冊定義)
        difficultyDesc: median >= 85 ? "難度簡單：中位數近 100 分，大家普遍考得好。" 
                      : median >= 70 ? "難度適中：中位數 70-80 分，具良好辨別力。" 
                      : "具挑戰性：中位數約 60 分，題目較困難。"
      };
    });
    return results;
  }, [subjectData]);

  // --- API 呼叫 ---
  const callGeminiVision = async (base64Data, mimeType) => {
    const systemPrompt = `你是一位高精度教育數據辨識專家，請執行【雙重校準回推邏輯】。
    
    【Task 1: OCR 數字定錨】
    精確讀取表格中的數字：
    - 「個人分數」 ($S$)
    - 「班級平均」 ($Avg$)
    
    【Task 2: 幾何測量與回推】
    利用圖像中「個人分數 ($S$)」的物理位置作為比例尺 ($R_{base}$)，推算箱型圖特徵。
    
    **特徵定義 (嚴格)**：
    - **Q1**：黑色箱子左邊緣。
    - **中位數 (Median)**：黑色箱子內部的「垂直白線」。⚠️絕對不是菱形！
    - **Q3**：黑色箱子右邊緣。
    - **Min/Max**：鬚線左右端點。
    
    **運算邏輯**：
    1. 測量 0 到 $S$ 的距離 $P_s$。
    2. 計算 $Ratio = S / P_s$。
    3. 回推 Q1, Median, Q3, Min, Max 的分數。
    
    【Task 3: 邏輯自洽檢驗】
    - 確保 $Q1 \\le Median \\le Q3$。
    - 確保 $Min \\le Q1$ 且 $Q3 \\le Max$。
    
    請輸出 JSON (Key 為繁體中文):
    {
      "國語": { 
        "score": 90, "average": 85,
        "min": 60, "q1": 75, "median": 82, "q3": 92, "max": 98,
        "calibrationStatus": "success"
      },
      ...
    }`;

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: "請優先 OCR 讀取分數。利用個人分數位置回推箱型圖 Q1, Median, Q3 (不需 Min/Max)。" },
              { inlineData: { mimeType: mimeType, data: base64Data } }
            ]
          }],
          systemInstruction: { parts: [{ text: systemPrompt }] },
          generationConfig: { responseMimeType: "application/json" }
        })
      });
      if (!response.ok) throw new Error('API Error');
      const result = await response.json();
      let textResponse = result.candidates[0].content.parts[0].text;
      textResponse = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(textResponse);
    } catch (error) { throw error; }
  };

  const processFile = useCallback(async (file) => {
    if (!file) return;
    // 關閉歡迎視窗，進入分析模式
    setShowIntroModal(false); 
    setIsAnalyzing(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Data = reader.result.split(',')[1];
      const mimeType = file.type || (file.name.endsWith('.pdf') ? 'application/pdf' : 'image/png');
      try {
        const data = await callGeminiVision(base64Data, mimeType);
        const newTempData = {};
        SUBJECTS.forEach(sub => {
          const key = Object.keys(data).find(k => k === sub || k.includes(sub)) || sub;
          const subData = data[key] || {};
          newTempData[sub] = {
            score: Number(subData.score) || 0,
            average: Number(subData.average) || 0,
            min: Number(subData.min) || 0,
            q1: Number(subData.q1) || 0,
            median: Number(subData.median) || 0,
            q3: Number(subData.q3) || 0,
            max: Number(subData.max) || 100,
            visualZone: '分析完成',
            calibrationStatus: subData.calibrationStatus || 'pending'
          };
        });
        setTempData(newTempData);
        setShowVerifyModal(true);
      } catch (err) { alert('辨識發生錯誤，請確保圖片清晰。'); }
      finally { setIsAnalyzing(false); }
    };
    reader.readAsDataURL(file);
  }, []);

  const handleConfirmData = () => { 
    setSubjectData(tempData); 
    setShowVerifyModal(false); 
    
    const d = new Date();
    setTestName(`${d.getFullYear()}/${d.getMonth()+1}/${d.getDate()} 測驗`);
    setShowSavePrompt(true);
  };

  const handleSaveHistory = () => {
    const newRecord = {
      id: Date.now(),
      name: testName,
      date: new Date().toISOString(),
      data: tempData
    };
    setHistory([...history, newRecord]);
    setShowSavePrompt(false);
    setShowSuccessModal(true);
  };

  const handleSkipSave = () => {
    setShowSavePrompt(false);
    setShowSuccessModal(true);
  };

  const handleClearHistory = () => {
    if(window.confirm('確定要清除所有歷史紀錄嗎？這個動作無法復原。')) {
      setHistory([]);
    }
  };

  const handleViewReport = () => {
    setShowSuccessModal(false);
    setTimeout(() => {
      if (reportSectionRef.current) {
        reportSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const handleTempDataChange = (sub, field, value) => {
    setTempData(prev => ({ ...prev, [sub]: { ...prev[sub], [field]: Number(value) } }));
  };

  const handleCopyAll = () => {
    let report = "【學業表現智能診斷報告】\n\n";
    SUBJECTS.forEach(sub => {
      const res = currentAnalysis[sub];
      // 安全存取
      const status = res?.personalStatus || "";
      const desc = res?.personalDesc || "";
      const advice = res?.selectedAdvice || "";
      report += `[${sub}]\n● 落點：${status} - ${desc}\n● 建議：${advice}\n\n`;
    });
    const t = document.createElement("textarea"); t.value = report; document.body.appendChild(t);
    t.select(); document.execCommand('copy'); document.body.removeChild(t);
    setUploadStatus('copied'); setTimeout(() => setUploadStatus(null), 2000);
  };

  return (
    <div className="min-h-screen bg-orange-50/30 text-slate-800 p-4 md:p-8 font-sans relative" 
         onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }} 
         onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }} 
         onDrop={(e) => { e.preventDefault(); setIsDragging(false); if(e.dataTransfer.files[0]) processFile(e.dataTransfer.files[0]); }}>
      
      {/* 拖曳遮罩 */}
      {isDragging && (
        <div className="fixed inset-0 z-[100] bg-amber-100/80 backdrop-blur-sm border-8 border-amber-400 m-4 rounded-[3rem] flex flex-col items-center justify-center pointer-events-none transition-all">
          <Sun className="text-amber-500 animate-spin-slow mb-4" size={100} />
          <h2 className="text-3xl font-black text-amber-600 uppercase tracking-widest text-center">放開以開始陽光診斷</h2>
        </div>
      )}

      {/* 首頁歡迎與使用說明視窗 (Intro Modal) */}
      {showIntroModal && (
        <div className="fixed inset-0 z-[80] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-500">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl p-6 md:p-8 relative overflow-x-hidden overflow-y-auto max-h-[90vh] scale-in-center">
              {/* 裝飾背景 */}
              <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-amber-100 to-orange-50 -z-10 rounded-b-[50%] scale-x-150 translate-y-[-40%]"></div>
              
              <div className="text-center mb-6 md:mb-8 pt-2">
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-white rounded-full mx-auto shadow-xl flex items-center justify-center mb-4 text-amber-500 ring-4 ring-amber-50">
                      <Sun size={48} fill="currentColor" className="animate-spin-slow w-10 h-10 md:w-12 md:h-12" />
                  </div>
                  <h2 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">歡迎使用學業診斷系統</h2>
                  <p className="text-slate-500 mt-2 font-medium text-sm md:text-base">五個步驟，陪伴孩子自信成長</p>
              </div>

              <div className="space-y-3 md:space-y-4 px-1 md:px-2">
                  <div className="flex gap-3 md:gap-4 items-center bg-slate-50 p-2.5 md:p-3 rounded-2xl border border-slate-100">
                      <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 shadow-sm"><Upload size={18} className="md:w-5 md:h-5"/></div>
                      <p className="text-slate-700 font-bold text-sm md:text-base">1. 上傳成績單</p>
                  </div>
                   <div className="flex gap-3 md:gap-4 items-center bg-slate-50 p-2.5 md:p-3 rounded-2xl border border-slate-100">
                      <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 shadow-sm"><Sparkles size={18} className="md:w-5 md:h-5"/></div>
                      <p className="text-slate-700 font-bold text-sm md:text-base">2. 等待後 AI 辨識數據</p>
                  </div>
                   <div className="flex gap-3 md:gap-4 items-center bg-slate-50 p-2.5 md:p-3 rounded-2xl border border-slate-100">
                      <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 shadow-sm"><Edit3 size={18} className="md:w-5 md:h-5"/></div>
                      <p className="text-slate-700 font-bold text-sm md:text-base">3. 協助確認分數數據無誤</p>
                  </div>
                   <div className="flex gap-3 md:gap-4 items-center bg-slate-50 p-2.5 md:p-3 rounded-2xl border border-slate-100">
                      <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0 shadow-sm"><FileText size={18} className="md:w-5 md:h-5"/></div>
                      <p className="text-slate-700 font-bold text-sm md:text-base">4. 閱讀分析結果</p>
                  </div>
                   <div className="flex gap-3 md:gap-4 items-center bg-slate-50 p-2.5 md:p-3 rounded-2xl border border-slate-100">
                      <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 shadow-sm"><Users size={18} className="md:w-5 md:h-5"/></div>
                      <p className="text-slate-700 font-bold text-sm md:text-base">5. 與孩子討論成長方向</p>
                  </div>
              </div>

              <button 
                  onClick={() => setShowIntroModal(false)}
                  className="w-full mt-6 md:mt-8 py-3.5 md:py-4 bg-gradient-to-r from-amber-400 to-orange-500 rounded-2xl text-white font-black text-base md:text-lg shadow-lg shadow-orange-200 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 shrink-0"
              >
                  開始體驗 <ChevronRight size={20}/>
              </button>
          </div>
        </div>
      )}

      {/* 分析完成成功視窗 */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[2rem] w-full max-w-sm shadow-2xl p-8 flex flex-col items-center text-center scale-in-center border-4 border-white">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6 animate-bounce">
              <CheckCircle className="w-10 h-10 text-emerald-600" />
            </div>
            <h3 className="text-2xl font-black text-slate-800 mb-2">分析完成！</h3>
            <p className="text-slate-500 mb-8 font-medium">您的專屬學業診斷報告已生成。</p>
            <button 
              onClick={handleViewReport} 
              className="w-full px-8 py-4 rounded-2xl font-black text-white bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 shadow-lg shadow-blue-200 transition-all hover:-translate-y-1"
            >
              查看詳細報告
            </button>
          </div>
        </div>
      )}

      {/* 儲存測驗對話框 */}
      {showSavePrompt && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl p-8 flex flex-col items-center text-center scale-in-center border-4 border-white">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6 text-blue-600">
              <Clipboard size={32} />
            </div>
            <h3 className="text-2xl font-black text-slate-800 mb-2">為這次測驗命名</h3>
            <p className="text-slate-500 mb-6 font-medium">記錄下來，方便未來追蹤進步軌跡！</p>
            <input 
              type="text" 
              value={testName}
              onChange={(e) => setTestName(e.target.value)}
              className="w-full text-center font-bold text-lg bg-slate-50 border-2 border-slate-200 rounded-xl py-3 px-4 outline-none focus:border-blue-400 focus:bg-white mb-8"
            />
            <div className="flex gap-4 w-full">
              <button onClick={handleSkipSave} className="flex-1 py-4 font-bold text-slate-400 hover:bg-slate-50 rounded-2xl transition-colors text-sm md:text-base">不儲存直接看</button>
              <button onClick={handleSaveHistory} className="flex-1 py-4 rounded-2xl font-black text-white bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 shadow-xl shadow-blue-200 transition-all hover:-translate-y-1 text-sm md:text-base">儲存紀錄</button>
            </div>
          </div>
        </div>
      )}

      {/* 數據確認視窗 (精簡版：移除 Min/Max) */}
      {showVerifyModal && tempData && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[2rem] w-full max-w-6xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] scale-in-center border-4 border-white">
            <div className="bg-gradient-to-r from-amber-400 to-orange-500 p-6 md:p-8 flex justify-between items-center text-white shadow-md relative z-10">
              <h3 className="text-lg md:text-2xl font-black flex items-center gap-3"><Edit3 className="w-6 h-6 md:w-8 md:h-8" /> 確認測量數據</h3>
              <X className="cursor-pointer hover:rotate-90 transition-transform bg-white/20 rounded-full p-1" onClick={() => setShowVerifyModal(false)} />
            </div>
            <div className="p-4 md:p-8 overflow-y-auto flex-1 bg-orange-50/30">
              <div className="bg-sky-50 border-l-4 border-sky-400 p-4 mb-6 text-sky-700 text-sm font-bold flex items-center gap-3 rounded-r-xl">
                <Target size={20} className="shrink-0 text-sky-500" /> 
                <span>AI 已逆向測量。請核對「個人分數」與「中位數」是否準確。</span>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {SUBJECTS.map(sub => (
                  <div key={sub} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col xl:flex-row gap-4 items-center relative overflow-hidden">
                    <h4 className="font-black text-slate-700 text-center w-full xl:w-20 shrink-0 text-lg border-b xl:border-b-0 xl:border-r border-slate-100 pb-2 xl:pb-0">{sub}</h4>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 w-full">
                      <div className="md:col-span-1">
                        <label className="text-[10px] text-slate-400 block font-bold mb-1">個人分數</label>
                        <input type="number" value={tempData[sub].score} onChange={(e) => handleTempDataChange(sub, 'score', e.target.value)} className="w-full text-center font-black text-lg bg-orange-50 rounded-xl py-2 text-orange-600 outline-none focus:ring-2 focus:ring-orange-300" />
                      </div>
                      <div className="md:col-span-1">
                        <label className="text-[10px] text-slate-400 block font-bold mb-1">班平均</label>
                        <input type="number" value={tempData[sub].average} onChange={(e) => handleTempDataChange(sub, 'average', e.target.value)} className="w-full text-center font-bold text-lg bg-slate-50 rounded-xl py-2 text-slate-600 outline-none focus:ring-2 focus:ring-slate-300" />
                      </div>
                      <div className="md:col-span-1">
                        <label className="text-[10px] text-slate-400 block mb-1 font-bold">Q1</label>
                        <input type="number" value={tempData[sub].q1} onChange={(e) => handleTempDataChange(sub, 'q1', e.target.value)} className="w-full text-center text-base bg-slate-50 rounded-xl py-2 outline-none focus:ring-1 focus:ring-slate-200" />
                      </div>
                      <div className="md:col-span-1">
                        <label className="text-[10px] text-slate-400 block font-black mb-1 tracking-wider uppercase">中位數</label>
                        <input type="number" value={tempData[sub].median} onChange={(e) => handleTempDataChange(sub, 'median', e.target.value)} className="w-full text-center text-lg bg-sky-50 rounded-xl py-2 font-bold text-sky-700 outline-none focus:ring-2 focus:ring-sky-200" />
                      </div>
                      <div className="md:col-span-1 col-span-2 md:col-auto">
                        <label className="text-[10px] text-slate-400 block mb-1 font-bold">Q3</label>
                        <input type="number" value={tempData[sub].q3} onChange={(e) => handleTempDataChange(sub, 'q3', e.target.value)} className="w-full text-center text-base bg-slate-50 rounded-xl py-2 outline-none focus:ring-1 focus:ring-slate-200" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-6 md:p-8 border-t bg-white flex flex-col-reverse md:flex-row justify-end gap-4">
              <button onClick={() => setShowVerifyModal(false)} className="w-full md:w-auto px-8 py-3 font-bold text-slate-400 hover:bg-slate-50 rounded-2xl transition-colors">取消</button>
              <button onClick={handleConfirmData} className="w-full md:w-auto px-12 py-4 rounded-2xl font-black text-white bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 shadow-xl shadow-blue-200 transition-all hover:-translate-y-1">下一步：產出建議</button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 px-2 md:px-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-800 flex items-center gap-3">
              <div className="bg-gradient-to-tr from-amber-400 to-orange-500 p-3 rounded-2xl shadow-lg text-white">
                <Sun size={32} fill="white" />
              </div>
              學業表現智能診斷
            </h1>
            <p className="text-slate-500 mt-2 font-bold flex items-center gap-2 text-sm md:text-base">
               <Sparkles size={18} className="text-amber-400 fill-amber-400" /> 解析學習落點，提供正向成長指引
            </p>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <label className={`cursor-pointer flex-1 md:flex-none flex justify-center items-center gap-2 px-6 py-4 md:px-8 md:py-5 rounded-2xl md:rounded-3xl font-black transition-all shadow-xl shadow-indigo-100 active:scale-95 text-sm md:text-base ${isAnalyzing ? 'bg-slate-200 text-slate-400' : 'bg-gradient-to-r from-indigo-500 to-blue-600 text-white hover:from-indigo-600 hover:to-blue-700 hover:-translate-y-1'}`}>
              {isAnalyzing ? <Loader2 className="animate-spin" size={20} /> : <Upload size={20} />}
              {isAnalyzing ? '讀取中...' : '上傳成績單'}
              <input type="file" className="hidden" accept="image/*,application/pdf" onChange={(e) => processFile(e.target.files[0])} disabled={isAnalyzing} />
            </label>
            <button onClick={handleCopyAll} className="flex-1 md:flex-none flex justify-center items-center bg-white border-2 border-slate-200 px-6 py-4 md:px-8 md:py-5 rounded-2xl md:rounded-3xl font-black hover:bg-slate-50 transition-all text-slate-600 gap-2 shadow-sm hover:shadow-md text-sm md:text-base">
              <Clipboard size={20} /> {uploadStatus === 'copied' ? '已複製' : '產出報告'}
            </button>
          </div>
        </header>

        {/* --- 【簡化版】箱型圖解讀指南 (亮色版) --- */}
        <section className="bg-white rounded-[3rem] md:rounded-[4rem] p-8 md:p-12 lg:p-16 shadow-xl shadow-slate-100 border border-slate-100 relative overflow-hidden mb-16">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-50 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
          
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-12 md:mb-14 pb-8 border-b border-slate-100 relative z-10">
            <div className="p-4 md:p-5 bg-orange-100 rounded-[1.5rem] md:rounded-[2rem] text-orange-500 shadow-sm"><BookOpen size={32} className="md:w-10 md:h-10"/></div>
            <div>
              <h2 className="text-2xl md:text-4xl font-black text-slate-800 tracking-tight">【簡化版】箱型圖解讀指南</h2>
              <p className="text-slate-400 font-bold mt-2 text-base md:text-lg">快速掌握圖像背後的教育意義</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 md:gap-16 relative z-10">
            {/* 黑色箱子 */}
            <div className="space-y-6 md:space-y-8">
              <h3 className="text-xl md:text-2xl font-black text-slate-700 flex items-center gap-3"><Layers className="text-sky-500" /> 黑色箱子</h3>
              <div className="bg-slate-50 p-6 md:p-8 rounded-3xl border border-slate-100 flex items-center justify-center mb-4 shadow-inner">
                 <div className="w-full h-12 md:h-14 bg-slate-200/50 rounded-xl relative border-2 border-slate-300 overflow-hidden flex items-center px-6 md:px-10">
                    <div className="w-full h-[3px] bg-slate-300"></div>
                    <div className="absolute inset-y-0 left-[25%] right-[25%] bg-slate-800 border-x-[4px] md:border-x-[6px] border-sky-400 shadow-xl"></div>
                 </div>
              </div>
              <div className="text-base md:text-lg text-slate-600 space-y-4 md:space-y-6">
                <div className="p-4 md:p-5 bg-sky-50 rounded-3xl border-l-8 border-sky-400">
                   <p className="text-[10px] md:text-xs font-black text-sky-600 mb-1 md:mb-2 uppercase tracking-widest leading-none">(中間 50% 的成績分佈區間)</p>
                   <p className="font-bold text-slate-700">代表班上中間程度同學的分數落點區間。</p>
                </div>
                <div className="space-y-3 md:space-y-4 pt-2">
                  <div className="flex items-center gap-4 md:gap-5 bg-white p-4 md:p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
                    <div className="w-3 h-10 bg-sky-400 rounded-full"></div>
                    <p className="font-bold text-slate-600 text-sm md:text-base">箱子越窄：表示程度越接近。</p>
                  </div>
                  <div className="flex items-center gap-4 md:gap-5 bg-white p-4 md:p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
                    <div className="w-12 h-10 bg-sky-400 rounded-xl"></div>
                    <p className="font-bold text-slate-600 text-sm md:text-base">箱子越寬：表示程度越分散。</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 箱子的位置 */}
            <div className="space-y-8 md:space-y-10 border-t pt-8 lg:border-t-0 lg:pt-0 lg:border-l border-slate-100 lg:pl-16">
              <h3 className="text-xl md:text-2xl font-black text-slate-700 flex items-center gap-3"><Target className="text-emerald-500" /> 箱子的位置</h3>
              <p className="text-slate-400 font-bold tracking-widest text-xs uppercase">粗估考卷難易度：</p>
              <div className="space-y-6 md:space-y-8">
                {[
                  { label: "靠近 100 分", desc: "中間段同學考高分，多數掌握測驗內容或測驗內容簡單。", color: "bg-emerald-400" },
                  { label: "在及格線之上", desc: "中間段同學理解多數概念，測驗難度適中。", color: "bg-sky-400" },
                  { label: "靠近及格線", desc: "中間段同學徘徊在及格邊緣，測驗內容具挑戰性。", color: "bg-amber-400" },
                  { label: "低於及格線", desc: "代表多數學生不及格，測驗難度偏難或未吸收內容。", color: "bg-rose-400" },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4 md:gap-6 group items-start">
                    <div className={`mt-1.5 w-4 h-4 md:w-5 md:h-5 rounded-full ${item.color} shadow-lg shrink-0 group-hover:scale-110 transition-transform`}></div>
                    <div className="space-y-1">
                      <p className="font-black text-slate-700 text-lg md:text-xl leading-none">{item.label}</p>
                      <p className="text-sm text-slate-500 font-bold leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 孩子的落點 */}
            <div className="space-y-8 md:space-y-10 border-t pt-8 lg:border-t-0 lg:pt-0 lg:border-l border-slate-100 lg:pl-16">
              <h3 className="text-xl md:text-2xl font-black text-slate-700 flex items-center gap-3"><Activity className="text-pink-500" /> 孩子的落點位置</h3>
              <p className="text-slate-400 font-bold tracking-widest text-xs uppercase">學習表現解讀：</p>
              <div className="space-y-4 md:space-y-5">
                {[
                  { title: "精熟表現區間", text: "分數在箱子右側，優於 75% 的同學。", color: "border-emerald-400", bg: "bg-emerald-50", textCol: "text-emerald-700" },
                  { title: "穩健發揮區間", text: "分數在箱子右半部，位居班級中上位置。", color: "border-blue-400", bg: "bg-blue-50", textCol: "text-blue-700" },
                  { title: "努力成長區間", text: "分數在箱子左半部，位居班級中下位置。", color: "border-amber-400", bg: "bg-amber-50", textCol: "text-amber-700" },
                  { title: "開發潛力區間", text: "分數在箱子左側，位後段需加強基礎紮根。", color: "border-rose-400", bg: "bg-rose-50", textCol: "text-rose-700" },
                ].map((item, i) => (
                  <div key={i} className={`${item.bg} p-5 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border-l-[8px] md:border-l-[12px] hover:translate-x-2 transition-all shadow-sm ${item.color}`}>
                    <p className={`font-black mb-1 text-base md:text-lg ${item.textCol}`}>{item.title}</p>
                    <p className={`text-sm font-bold leading-relaxed ${item.textCol} opacity-80`}>{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 診斷報告主區 */}
        <div ref={reportSectionRef} className="space-y-10 md:space-y-12 mb-20 px-2 md:px-0 scroll-mt-8">
          {SUBJECTS.map(sub => {
            const res = currentAnalysis[sub];
            const data = subjectData[sub];
            const hasData = data.q3 > 0;
            // FIX: 確保 res 和 res.cardStyle 存在
            const style = res?.cardStyle || {
               border: "border-slate-200",
               bg: "bg-white",
               sidebar: "bg-slate-50",
               iconColor: "text-slate-400",
               titleColor: "text-slate-800",
               highlight: "text-slate-600"
            };

            return (
              <div key={`diag-${sub}`} className={`rounded-[3rem] md:rounded-[4rem] p-6 md:p-10 shadow-xl border-4 transition-all relative overflow-hidden group bg-white ${style.border} hover:shadow-2xl`}>
                
                <div className="flex flex-col lg:flex-row gap-10 lg:gap-14 items-stretch relative z-10">
                  {/* 左側：數據總覽 */}
                  <div className={`w-full lg:w-1/4 border-b lg:border-b-0 lg:border-r border-slate-100 pb-8 lg:pb-0 lg:pr-10 flex flex-col justify-center text-center lg:text-left rounded-3xl lg:rounded-r-none -ml-4 pl-4 ${style.sidebar}`}>
                    <div className="flex items-center justify-center lg:justify-start gap-5 mb-8 md:mb-10">
                      <div className="w-20 h-20 md:w-24 md:h-24 rounded-3xl bg-white text-white flex items-center justify-center font-black text-4xl shadow-xl group-hover:rotate-12 transition-transform border-4 border-white/50">
                        <span className="text-slate-700">{sub.charAt(0)}</span>
                      </div>
                      <div className="text-left">
                        <h4 className={`text-3xl md:text-4xl font-black text-slate-800`}>{sub}</h4>
                        <span className="text-xs font-bold text-slate-500 flex items-center gap-1 mt-1">{res?.subjectInfo?.icon} {res?.subjectInfo?.title}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-1 gap-5">
                      <div className={`p-5 md:p-6 rounded-[2.5rem] border border-white/60 bg-white/60 shadow-sm`}>
                        <span className={`text-[10px] font-black uppercase tracking-widest block mb-2 ${style.iconColor}`}>個人分數</span>
                        <span className={`text-4xl md:text-5xl font-black ${style.highlight}`}>{data.score}</span>
                      </div>
                      <div className="bg-white/40 p-5 md:p-6 rounded-[2.5rem] border border-slate-100/50">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">班級平均</span>
                        <span className="text-3xl md:text-4xl font-bold text-slate-500">{data.average}</span>
                      </div>
                    </div>
                  </div>

                  {/* 右側：診斷內容 */}
                  <div className="w-full lg:w-3/4 flex flex-col justify-between gap-8">
                    
                    {/* (1) 復刻箱型圖 (幾何視覺化) - 高對比 */}
                    {hasData && (
                      <div className="bg-slate-100 rounded-3xl p-6 md:p-8 border border-slate-200 shadow-inner relative overflow-hidden">
                        <div className="relative h-20 w-full flex items-center px-2">
                          {/* 刻度文字 */}
                          <div className="absolute inset-x-2 -bottom-2 flex justify-between pointer-events-none">
                            {[0, 20, 40, 60, 80, 100].map(v => (
                              <span key={v} className="text-[10px] font-mono font-bold text-slate-400 w-6 text-center -ml-3">{v}</span>
                            ))}
                          </div>
                          <div className="absolute inset-x-2 bottom-6 top-4 flex justify-between pointer-events-none">
                            {[0, 20, 40, 60, 80, 100].map(v => (
                              <div key={v} className="w-px h-full bg-slate-300 relative"></div>
                            ))}
                          </div>
                          
                          {/* 箱子 (高度增加，更清晰) */}
                          <div className="absolute h-12 bg-slate-800 z-10 shadow-lg rounded-sm border-x border-slate-900"
                               style={{ left: `calc(${data.q1}% + 8px)`, width: `calc(${data.q3 - data.q1}% - 8px)` }}></div>
                          
                          {/* 中位數 (加粗) */}
                          <div className="absolute h-12 w-[4px] bg-white z-20 shadow-sm" style={{ left: `calc(${data.median}% + 8px)` }}></div>
                          
                          {/* 班平均 */}
                          <div className="absolute w-4 h-4 bg-white border-2 border-slate-900 rotate-45 z-30 shadow-md" style={{ left: `calc(${data.average}% + 0px)` }}></div>
                          
                          {/* 個人分數 */}
                          <div className="absolute w-6 h-6 bg-white border-[3px] border-indigo-600 rounded-full z-40 shadow-xl" style={{ left: `calc(${data.score}% - 4px)` }}></div>
                        </div>
                      </div>
                    )}

                    {/* (2) 白話文診斷 */}
                    <div className="bg-[#FFFBF0] p-6 md:p-8 rounded-[2rem] border border-amber-100 hover:shadow-lg transition-all flex flex-col justify-center">
                       <h5 className="font-black text-slate-800 text-base md:text-xl mb-3 flex items-center gap-2">
                         <Target size={20} className="text-amber-500" />
                         落點分析與班級狀況
                       </h5>
                       
                       {/* 修正點：大標顯示標籤，小標顯示描述 */}
                       <h6 className={`text-xl font-black ${style.highlight} mb-1`}>{res?.personalStatus}</h6>
                       <p className="text-slate-600 text-sm font-medium leading-relaxed mb-4">{res?.personalDesc}</p>

                       <div className="mt-4 pt-4 border-t border-amber-200/50 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs md:text-sm text-slate-600 font-medium">
                         <span className="flex items-center gap-2"><Layers size={14} className="text-slate-400"/> {res?.difficultyDesc}</span>
                         <span className="flex items-center gap-2"><Scale size={14} className="text-slate-400"/> {res?.dispersionDesc}</span>
                       </div>
                    </div>

                    {/* (3) 多元化正向建議 */}
                    <div className="bg-gradient-to-br from-sky-500 to-indigo-600 rounded-[2.5rem] p-8 md:p-10 text-white shadow-2xl shadow-blue-200 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-6 opacity-10"><Lightbulb size={120} /></div>
                      <div className="flex flex-col md:flex-row items-start gap-4 md:gap-8 relative z-10">
                        <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-white/20 flex items-center justify-center shrink-0 mt-1 backdrop-blur-sm"><MessageSquare size={32} className="text-white" /></div>
                        <div>
                          <h5 className="font-black text-sky-100 text-xs md:text-sm uppercase tracking-widest mb-4">專家建議</h5>
                          <ul className="space-y-4">
                            <li className="flex gap-3 text-sm md:text-lg font-bold leading-relaxed opacity-95">
                              <Check className="text-sky-200 mt-1 shrink-0" size={20} />
                              {res?.selectedAdvice}
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 歷史成長軌跡區塊 */}
        {history.length > 0 && (
          <section className="bg-white rounded-[3rem] md:rounded-[4rem] p-8 md:p-12 lg:p-16 shadow-xl shadow-slate-100 border border-slate-100 relative overflow-hidden mb-16">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 pb-6 border-b border-slate-100">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-indigo-100 rounded-2xl text-indigo-500 shadow-sm"><History size={28}/></div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-black text-slate-800">成長軌跡</h2>
                  <p className="text-slate-400 font-bold mt-1">追蹤每一次的進步與變化</p>
                </div>
              </div>
              <button onClick={handleClearHistory} className="flex items-center gap-2 px-4 py-2 text-rose-500 font-bold hover:bg-rose-50 rounded-xl transition-colors">
                <Trash2 size={16} /> 清除紀錄
              </button>
            </div>
            
            <div className="h-80 w-full mb-8">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={history.map(record => {
                  const dataPoint = { name: record.name };
                  SUBJECTS.forEach(sub => { dataPoint[sub] = record.data[sub]?.score || 0; });
                  return dataPoint;
                })} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="name" tick={{fill: '#94a3b8', fontSize: 12}} tickLine={false} axisLine={false} />
                  <YAxis domain={[0, 100]} tick={{fill: '#94a3b8', fontSize: 12}} tickLine={false} axisLine={false} />
                  <RechartsTooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)', fontWeight: 'bold'}} />
                  <Legend iconType="circle" wrapperStyle={{fontSize: '12px', fontWeight: 'bold', color: '#64748b'}} />
                  <Line type="monotone" dataKey="國語" stroke="#ef4444" strokeWidth={3} dot={{strokeWidth: 2, r: 4}} activeDot={{r: 6}} />
                  <Line type="monotone" dataKey="數學" stroke="#3b82f6" strokeWidth={3} dot={{strokeWidth: 2, r: 4}} activeDot={{r: 6}} />
                  <Line type="monotone" dataKey="社會" stroke="#f59e0b" strokeWidth={3} dot={{strokeWidth: 2, r: 4}} activeDot={{r: 6}} />
                  <Line type="monotone" dataKey="英文" stroke="#10b981" strokeWidth={3} dot={{strokeWidth: 2, r: 4}} activeDot={{r: 6}} />
                  <Line type="monotone" dataKey="自然" stroke="#8b5cf6" strokeWidth={3} dot={{strokeWidth: 2, r: 4}} activeDot={{r: 6}} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {history.map((record, idx) => (
                <div key={record.id} className="bg-slate-50 p-5 rounded-2xl border border-slate-100 hover:shadow-md transition-shadow cursor-pointer"
                     onClick={() => { setSubjectData(record.data); handleViewReport(); }}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-black text-slate-700 text-lg">{record.name}</span>
                    <span className="text-xs font-bold text-slate-400 bg-white px-2 py-1 rounded-lg border border-slate-100">#{idx + 1}</span>
                  </div>
                  <div className="text-sm font-medium text-slate-500">
                    點擊回顧詳細分析報告 <ChevronRight size={14} className="inline"/>
                  </div>
                </div>
              ))}
            </div>
          </section>

        {/* 給家長的正向溝通心法 */}
        <section className="bg-white rounded-[3rem] p-8 md:p-16 shadow-xl shadow-slate-100 border border-slate-100 mb-12">
          <div className="text-center mb-10 md:mb-12">
            <h2 className="text-2xl md:text-3xl font-black text-slate-800 flex items-center justify-center gap-3">
              <Heart className="text-rose-400 fill-rose-400" /> 給家長的正向溝通心法
            </h2>
            <p className="text-slate-400 mt-2 font-bold text-sm md:text-base">陪伴孩子面對成績的三個溫暖視角</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
             <div className="space-y-4">
               <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-2"><Eye size={24}/></div>
               <h3 className="font-black text-lg md:text-xl text-slate-700">看區間不看分數</h3>
               <p className="text-slate-500 leading-relaxed font-medium text-sm md:text-base">分數會隨考卷難度起伏，但「區間」能反映孩子在群體中真實且穩定的發展狀態。請關注孩子是否穩定在某個區間，而非執著於那一兩分的差距。</p>
             </div>
             <div className="space-y-4">
               <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mb-2"><Smile size={24}/></div>
               <h3 className="font-black text-lg md:text-xl text-slate-700">肯定努力的過程</h3>
               <p className="text-slate-500 leading-relaxed font-medium text-sm md:text-base">當你看見孩子在學習方法上有所微調（例如開始整理筆記、主動發問），請給予具體且及時的鼓勵。這比稱讚「你好聰明」更能建立長久的學習動力。</p>
             </div>
             <div className="space-y-4">
               <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 mb-2"><Zap size={24}/></div>
               <h3 className="font-black text-lg md:text-xl text-slate-700">建立成長型思維</h3>
               <p className="text-slate-500 leading-relaxed font-medium text-sm md:text-base">提醒孩子，暫時的落點只是當前的座標，而非終點。每一個小小的調整都是進步的開始。失敗不是能力不足，而是方法需要修正的訊號。</p>
             </div>
          </div>
        </section>

        <footer className="text-center py-10 opacity-40 text-xs font-black tracking-widest uppercase text-slate-400">
           High-Precision Educational Diagnosis System v15.0
        </footer>
      </div>
    </div>
  );
};

export default App;
