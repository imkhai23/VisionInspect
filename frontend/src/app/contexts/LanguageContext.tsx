'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'vi' | 'en';

const translations = {
  vi: {
    // AI Labels
    label_good: 'Đạt chất lượng',
    label_dent: 'Vết móp',
    label_crack: 'Vết nứt',
    label_scratch: 'Vết trầy xước',
    label_missing_part: 'Thiếu linh kiện',
    label_contamination: 'Bị nhiễm bẩn',
    label_normal: 'Bình thường',

    // Auth & General
    signIn: 'Đăng nhập',
    signInToAccount: 'Truy cập vào không gian làm việc của bạn',
    signUpFree: 'Đăng ký miễn phí',
    getStartedFree: 'Bắt đầu miễn phí',
    welcomeBack: 'Chào mừng quay trở lại',
    emailAddress: 'Địa chỉ Email',
    password: 'Mật khẩu',
    forgotPassword: 'Quên mật khẩu?',
    noAccount: 'Chưa có tài khoản?',
    alreadyHaveAccount: 'Đã có tài khoản?',
    registerNow: 'Đăng ký ngay',
    signingIn: 'Đang xác thực...',
    loginSuccess: 'Đăng nhập thành công!',
    loginFailed: 'Đăng nhập thất bại. Vui lòng kiểm tra lại.',
    logout: 'Đăng xuất',
    
    // Landing Page
    heroTitle: 'Kiểm tra Bất thường\nBằng Trí tuệ Nhân tạo',
    heroSubtitle: 'Giải pháp kiểm định hình ảnh thông minh giúp phát hiện lỗi bề mặt tự động với độ chính xác cực cao, tiết kiệm thời gian và chi phí.',
    startFree: 'Bắt đầu ngay',
    featuresTitle: 'Tính năng nổi bật',
    features: [
      { title: 'Tốc độ cực nhanh', desc: 'Xử lý hình ảnh và đưa ra kết quả phân tích trong chưa đầy 1 giây.' },
      { title: 'Độ chính xác cao', desc: 'Mô hình AI được huấn luyện trên hàng triệu mẫu lỗi công nghiệp.' },
      { title: 'Dễ dàng tích hợp', desc: 'API mạnh mẽ cho phép kết nối với mọi hệ thống sẵn có của bạn.' }
    ],
    footerText: 'Nền tảng kiểm định AI tiên phong.',

    // Dashboard
    dashboard: 'Tổng quan',
    inspectImage: 'Kiểm tra hình ảnh',
    history: 'Lịch sử kiểm tra',
    usagePlan: 'Gói dịch vụ',
    adminPanel: 'Quản trị hệ thống',
    loadingWorkspace: 'Đang chuẩn bị không gian làm việc...',
    
    // Inspect Page
    visualInspection: 'Kiểm tra Trực quan',
    aiSurfaceDetection: 'Sử dụng AI để phát hiện lỗi bề mặt trong tích tắc.',
    uploadToStart: 'Tải ảnh lên để bắt đầu',
    dragDropHint: 'Kéo thả hoặc nhấn để chọn file hình ảnh (JPG, PNG)',
    startAnalysis: 'Bắt đầu Phân tích AI',
    analyzing: 'Đang phân tích...',
    analysisResult: 'Kết quả Phân tích',
    confidence: 'Độ tin cậy',
    processingTime: 'Thời gian xử lý',
    detailScores: 'Tỉ lệ lỗi chi tiết',
    perfectSurface: 'Bề mặt Hoàn hảo',
    anomalyDetected: 'Phát hiện Bất thường',
    perfectDesc: 'Không phát hiện thấy dấu hiệu hư hỏng hoặc lỗi bề mặt nào.',
    anomalyDesc: 'Hệ thống đã phát hiện các dấu hiệu không đồng nhất. Vui lòng kiểm tra lại.',
    noResultYet: 'Chưa có kết quả',
    noResultDesc: 'Vui lòng tải ảnh lên và nhấn nút Phân tích để xem kết quả chi tiết.',
    
    // Usage Page
    billingUsage: 'Gói dịch vụ & Hạn mức',
    pricingSubtitle: 'Chọn gói dịch vụ phù hợp với nhu cầu sản xuất của bạn.',
    usageProgress: 'Tiến độ sử dụng',
    predictionsUsed: 'Dự đoán đã dùng',
    resetNotice: 'Hạn mức sẽ tự động reset vào đầu tháng tới.',
    currentPlan: 'Gói hiện tại',
    paymentMethods: 'Phương thức thanh toán',
    noPaymentMethod: 'Chưa có phương thức thanh toán nào được kết nối.',
    addPayment: 'Thêm phương thức mới +',
    billingHistory: 'Lịch sử hóa đơn',
    noBillingHistory: 'Chưa có giao dịch nào phát sinh.',
    viewAll: 'Xem tất cả',
    upgradeNow: 'Nâng cấp ngay',
    using: 'Đang sử dụng',
  },
  en: {
    // AI Labels
    label_good: 'Good/Quality',
    label_dent: 'Dent',
    label_crack: 'Crack',
    label_scratch: 'Scratch',
    label_missing_part: 'Missing Part',
    label_contamination: 'Contamination',
    label_normal: 'Normal',

    // Auth & General
    signIn: 'Sign In',
    signInToAccount: 'Access your workspace',
    signUpFree: 'Sign Up Free',
    getStartedFree: 'Get Started Free',
    welcomeBack: 'Welcome Back',
    emailAddress: 'Email Address',
    password: 'Password',
    forgotPassword: 'Forgot password?',
    noAccount: "Don't have an account?",
    alreadyHaveAccount: 'Already have an account?',
    registerNow: 'Register Now',
    signingIn: 'Authenticating...',
    loginSuccess: 'Login Successful!',
    loginFailed: 'Login Failed. Please check again.',
    logout: 'Logout',

    // Landing Page
    heroTitle: 'Anomaly Inspection\nPowered by AI',
    heroSubtitle: 'Smart visual inspection solution that automates surface defect detection with extreme accuracy, saving time and costs.',
    startFree: 'Get Started',
    featuresTitle: 'Key Features',
    features: [
      { title: 'Lightning Fast', desc: 'Process images and get analysis results in under 1 second.' },
      { title: 'High Accuracy', desc: 'AI models trained on millions of industrial defect samples.' },
      { title: 'Easy Integration', desc: 'Powerful APIs to connect with your existing systems.' }
    ],
    footerText: 'Leading AI Inspection Platform.',

    // Dashboard
    dashboard: 'Dashboard',
    inspectImage: 'Inspect Image',
    history: 'Inspection History',
    usagePlan: 'Usage & Plan',
    adminPanel: 'Admin Panel',
    loadingWorkspace: 'Preparing your workspace...',

    // Inspect Page
    visualInspection: 'Visual Inspection',
    aiSurfaceDetection: 'Use AI to detect surface defects in seconds.',
    uploadToStart: 'Upload image to start',
    dragDropHint: 'Drag and drop or click to select image (JPG, PNG)',
    startAnalysis: 'Start AI Analysis',
    analyzing: 'Analyzing...',
    analysisResult: 'Analysis Result',
    confidence: 'Confidence',
    processingTime: 'Processing Time',
    detailScores: 'Detailed Scores',
    perfectSurface: 'Perfect Surface',
    anomalyDetected: 'Anomaly Detected',
    perfectDesc: 'No signs of damage or surface defects detected on this object.',
    anomalyDesc: 'The system has detected inconsistencies. Please check manually.',
    noResultYet: 'No result yet',
    noResultDesc: 'Please upload an image and click Analyze to see detailed results.',

    // Usage Page
    billingUsage: 'Usage & Billing',
    pricingSubtitle: 'Choose the right plan for your production needs.',
    usageProgress: 'Usage Progress',
    predictionsUsed: 'Predictions Used',
    resetNotice: 'Limit will automatically reset at the beginning of next month.',
    currentPlan: 'Current Plan',
    paymentMethods: 'Payment Methods',
    noPaymentMethod: 'No payment methods connected.',
    addPayment: 'Add new method +',
    billingHistory: 'Billing History',
    noBillingHistory: 'No transactions found.',
    viewAll: 'View All',
    upgradeNow: 'Upgrade Now',
    using: 'In Use',
  }
};

type LanguageContextType = {
  lang: Language;
  t: typeof translations.vi;
  toggle: () => void;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Language>('vi');

  useEffect(() => {
    const saved = localStorage.getItem('lang') as Language;
    if (saved) setLang(saved);
  }, []);

  const toggle = () => {
    const newLang = lang === 'vi' ? 'en' : 'vi';
    setLang(newLang);
    localStorage.setItem('lang', newLang);
  };

  const value = {
    lang,
    t: translations[lang],
    toggle
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
