'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

type Lang = 'en' | 'vi';

// ── Translations ──────────────────────────────────────────────────────────────
const translations = {
  en: {
    // Nav
    signIn: 'Sign In',
    getStartedFree: 'Get Started Free',

    // Landing hero
    heroTitle: 'Detect Product Defects\nInstantly with AI',
    heroSubtitle:
      'Upload an image. Get instant AI-powered defect analysis. Built for manufacturers, QA teams, and quality engineers who demand precision.',
    startFree: 'Start for Free →',
    badgeLabel: '✨ AI-Powered Quality Inspection',

    // Stats
    statAccuracy: 'Detection Accuracy',
    statSpeed: 'Analysis Time',
    statClasses: 'Defect Classes',

    // Features section
    featuresTitle: 'Everything you need for quality control',
    features: [
      { icon: '⚡', title: 'Instant Analysis', desc: 'Get defect classification results in under 200ms with our optimized inference pipeline.' },
      { icon: '🎯', title: '6 Defect Classes', desc: 'Detect scratches, dents, cracks, contamination, missing parts, and good products.' },
      { icon: '📊', title: 'Analytics Dashboard', desc: 'Track your inspection history, usage stats, and defect trends over time.' },
      { icon: '🔒', title: 'Secure & Private', desc: 'Images are processed securely with JWT authentication and never stored permanently.' },
      { icon: '💳', title: 'Flexible Plans', desc: 'Start free with 50 inspections/month. Upgrade to Pro for unlimited access.' },
      { icon: '🚀', title: 'API Access', desc: 'Integrate directly with your production systems via our REST API.' },
    ],

    // Pricing
    pricingTitle: 'Simple, transparent pricing',
    pricingSubtitle: 'No hidden fees. No credit card required to start.',
    forever: 'forever',
    perMonth: 'per month',
    getStarted: 'Get Started',
    startProTrial: 'Start Pro Trial',
    freePlanFeatures: ['50 inspections/month', 'All 6 defect classes', 'Basic history (7 days)', 'Email support'],
    proPlanFeatures: ['Unlimited inspections', 'All 6 defect classes', '90-day history', 'REST API access', 'Priority queue', 'Priority support'],

    // Defect Labels
    defects: {
      good: 'Good (No Defect)',
      scratch: 'Scratch',
      dent: 'Dent',
      crack: 'Crack',
      contamination: 'Contamination',
      missing_part: 'Missing Part',
    },

    // Footer
    footerText: '© 2024 VisionInspect. Built with ❤️ using PyTorch + FastAPI + Next.js',

    // Auth
    welcomeBack: 'Welcome back',
    signInToAccount: 'Sign in to your account',
    emailAddress: 'Email address',
    password: 'Password',
    enterPassword: 'Enter your password',
    signingIn: 'Signing in...',
    noAccount: "Don't have an account?",
    signUpFree: 'Sign up free',

    createAccount: 'Create your account',
    startDetecting: 'Start detecting defects for free',
    fullName: 'Full name',
    confirmPassword: 'Confirm password',
    repeatPassword: 'Repeat your password',
    creatingAccount: 'Creating account...',
    createFreeAccount: 'Create Free Account',
    alreadyAccount: 'Already have an account?',
    termsNote: 'By signing up you agree to our Terms of Service and Privacy Policy.',

    // Dashboard sidebar
    dashboard: 'Dashboard',
    inspectImage: 'Inspect Image',
    history: 'History',
    usagePlan: 'Usage & Plan',
    upgradeToPro: 'Upgrade to Pro',
    adminPanel: 'Admin Panel',
    loadingWorkspace: 'Preparing your workspace...',
    billingUsage: 'Usage & Billing',
    billingSubtitle: 'Choose the right plan for your production needs.',
    usageProgress: 'Usage Progress',
    predictionsUsed: 'Predictions Used',
    resetNotice: 'Limit will automatically reset at the beginning of next month.',
    paymentMethods: 'Payment Methods',
    noPaymentMethod: 'No payment methods connected.',
    addPayment: 'Add new method +',
    billingHistory: 'Billing History',
    noBillingHistory: 'No transactions found.',
    viewAll: 'View All',
    using: 'In Use',
    upgradeDesc: 'Unlimited inspections + API access',
    upgradeNow: 'Upgrade Now',
    signOut: 'Sign Out',
    freePlan: '✓ Free Plan',
    proPlan: '⭐ Pro Plan',

    // Dashboard home
    dashboardTitle: 'Dashboard',
    dashboardSubtitle: 'Your inspection overview at a glance',
    totalInspections: 'Total Inspections',
    thisMonth: 'This Month',
    avgConfidence: 'Avg. Confidence',
    mostCommonDefect: 'Most Common Defect',
    monthlyUsage: 'Monthly Usage',
    unlimited: 'Unlimited — Pro Plan',
    inspectionsUsed: 'inspections used',
    usageWarning: 'inspections remaining',
    loadingDashboard: 'Loading dashboard...',
    newInspection: 'New Inspection',
    newInspectionDesc: 'Upload an image to analyze',
    viewHistory: 'View History',
    viewHistoryDesc: 'Browse past inspections',
    defectBreakdown: 'Defect Breakdown',
    noInspections: 'No inspections yet',
    noInspectionsDesc: 'Upload your first product image to get started',
    startFirstInspection: 'Start First Inspection',
    resets: 'Resets',

    analysisResult: 'Analysis Result',
    confidence: 'Confidence',
    processingTime: 'Processing Time',
    detailScores: 'Detailed Scores',
    visualInspection: 'Visual Inspection',
    aiSurfaceDetection: 'Use AI to detect surface defects in seconds.',
    perfectSurface: 'Perfect Surface',
    anomalyDetected: 'Anomaly Detected',
    perfectDesc: 'No signs of damage or surface defects detected on this object.',
    anomalyDesc: 'The system has detected inconsistencies. Please check manually.',

    // Inspect page
    inspectTitle: 'Inspect Image',
    inspectSubtitle: 'Upload a product image to detect defects using AI',
    dropImageOrBrowse: 'Drop an image or click to browse',
    dropHere: 'Drop it here',
    fileFormats: 'JPEG, PNG, WEBP · Max 10MB',
    analyzeImage: '🔍 Analyze Image',
    analyzing: 'Analyzing...',
    reset: 'Reset',
    resultsAppearHere: 'Analysis results will appear here',
    runningAI: 'Running AI analysis...',
    typicallyUnder: 'Typically takes under 200ms',
    noDefectsDetected: 'No defects detected',
    defectDetected: 'Defect detected',
    scoreBreakdown: 'SCORE BREAKDOWN',

    // Webcam
    useCamera: 'Use Camera',
    useUpload: 'Upload File',
    capture: 'Capture & Analyze',
    retake: 'Retake',
    cameraError: 'Camera access denied or not found',

    // History page
    historyTitle: 'Inspection History',
    totalInspectionsLabel: 'total inspections',
    loading: 'Loading...',
    file: 'File',
    result: 'Result',
    speed: 'Speed',
    date: 'Date',
    prev: '← Prev',
    next: 'Next →',
    page: 'Page',
    of: 'of',
    noHistory: 'No history yet',
    noHistoryDesc: 'Run your first inspection to see results here',
    startInspecting: 'Start Inspecting',

    // Usage page
    usageTitle: 'Usage & Plan',
    usageSubtitle: 'Manage your subscription and track your usage',
    thisMonthsUsage: "This Month's Usage",
    currentPlan: 'Current Plan',
    unlimitedInspections: '✓ Unlimited inspections',
    resetsOn: 'Resets on',
    cancels: 'Cancels on',
    renews: 'Renews on',
    cancelWarning: '⚠️ Your subscription will cancel at the end of this billing period',
    upgradeBtnLabel: '⭐ Upgrade to Pro — $29/mo',
    redirecting: 'Redirecting...',
    cancelSubscription: 'Cancel Subscription',
    canceling: 'Canceling...',
    remaining: 'remaining',
    percentUsed: 'used',
    planComparison: 'Plan Comparison',
    feature: 'Feature',
    free: 'Free',
    pro: 'Pro',
    planRows: [
      { feature: 'Inspections / month', free: '50', pro: 'Unlimited' },
      { feature: 'History retention', free: '7 days', pro: '90 days' },
      { feature: 'REST API access', free: '✗', pro: '✓' },
      { feature: 'Priority queue', free: '✗', pro: '✓' },
      { feature: 'Priority support', free: '✗', pro: '✓' },
      { feature: 'Price', free: '$0/mo', pro: '$29/mo' },
    ],
  },

  vi: {
    // Nav
    signIn: 'Đăng Nhập',
    getStartedFree: 'Dùng Miễn Phí',

    // Landing hero
    heroTitle: 'Phát Hiện Lỗi Sản Phẩm\nTức Thì Bằng AI',
    heroSubtitle:
      'Tải ảnh lên. Nhận phân tích lỗi bằng AI ngay lập tức. Được xây dựng cho nhà sản xuất, nhóm QA và kỹ sư chất lượng.',
    startFree: 'Bắt đầu miễn phí →',
    badgeLabel: '✨ Kiểm Tra Chất Lượng Bằng AI',

    // Stats
    statAccuracy: 'Độ Chính Xác',
    statSpeed: 'Thời Gian Phân Tích',
    statClasses: 'Loại Lỗi',

    // Features section
    featuresTitle: 'Tất cả những gì bạn cần để kiểm soát chất lượng',
    features: [
      { icon: '⚡', title: 'Phân Tích Tức Thì', desc: 'Nhận kết quả phân loại lỗi trong vòng 200ms với quy trình suy luận tối ưu.' },
      { icon: '🎯', title: '6 Loại Lỗi', desc: 'Phát hiện trầy xước, móp méo, vết nứt, nhiễm bẩn, thiếu linh kiện và sản phẩm tốt.' },
      { icon: '📊', title: 'Bảng Điều Khiển Phân Tích', desc: 'Theo dõi lịch sử kiểm tra, thống kê sử dụng và xu hướng lỗi theo thời gian.' },
      { icon: '🔒', title: 'Bảo Mật & Riêng Tư', desc: 'Hình ảnh được xử lý an toàn với xác thực JWT và không được lưu trữ vĩnh viễn.' },
      { icon: '💳', title: 'Gói Linh Hoạt', desc: 'Bắt đầu miễn phí với 50 lần kiểm tra/tháng. Nâng cấp lên Pro để sử dụng không giới hạn.' },
      { icon: '🚀', title: 'Truy Cập API', desc: 'Tích hợp trực tiếp với hệ thống sản xuất của bạn qua REST API.' },
    ],

    // Pricing
    pricingTitle: 'Bảng giá đơn giản, minh bạch',
    pricingSubtitle: 'Không phí ẩn. Không cần thẻ tín dụng để bắt đầu.',
    forever: 'mãi mãi',
    perMonth: 'mỗi tháng',
    getStarted: 'Bắt Đầu',
    startProTrial: 'Dùng Thử Pro',
    freePlanFeatures: ['50 lần kiểm tra/tháng', 'Đủ 6 loại lỗi', 'Lịch sử cơ bản (7 ngày)', 'Hỗ trợ qua email'],
    proPlanFeatures: ['Không giới hạn kiểm tra', 'Đủ 6 loại lỗi', 'Lịch sử 90 ngày', 'Truy cập REST API', 'Hàng đợi ưu tiên', 'Hỗ trợ ưu tiên'],

    // Defect Labels
    defects: {
      good: 'Sản phẩm tốt',
      scratch: 'Trầy xước',
      dent: 'Móp méo',
      crack: 'Vết nứt',
      contamination: 'Nhiễm bẩn',
      missing_part: 'Thiếu linh kiện',
    },

    // Footer
    footerText: '© 2024 VisionInspect. Xây dựng với ❤️ bằng PyTorch + FastAPI + Next.js',

    // Auth
    welcomeBack: 'Chào mừng trở lại',
    signInToAccount: 'Đăng nhập vào tài khoản của bạn',
    emailAddress: 'Địa chỉ email',
    password: 'Mật khẩu',
    enterPassword: 'Nhập mật khẩu',
    signingIn: 'Đang đăng nhập...',
    noAccount: 'Chưa có tài khoản?',
    signUpFree: 'Đăng ký miễn phí',

    createAccount: 'Tạo tài khoản',
    startDetecting: 'Bắt đầu phát hiện lỗi miễn phí',
    fullName: 'Họ và tên',
    confirmPassword: 'Xác nhận mật khẩu',
    repeatPassword: 'Nhập lại mật khẩu',
    creatingAccount: 'Đang tạo tài khoản...',
    createFreeAccount: 'Tạo Tài Khoản Miễn Phí',
    alreadyAccount: 'Đã có tài khoản?',
    termsNote: 'Bằng cách đăng ký, bạn đồng ý với Điều khoản dịch vụ và Chính sách bảo mật.',

    // Dashboard sidebar
    dashboard: 'Bảng Điều Khiển',
    inspectImage: 'Kiểm Tra Ảnh',
    history: 'Lịch Sử',
    usagePlan: 'Sử Dụng & Gói',
    upgradeToPro: 'Nâng Cấp Pro',
    adminPanel: 'Quản trị hệ thống',
    loadingWorkspace: 'Đang chuẩn bị không gian làm việc...',
    billingUsage: 'Gói dịch vụ & Hạn mức',
    billingSubtitle: 'Chọn gói dịch vụ phù hợp với nhu cầu sản xuất của bạn.',
    usageProgress: 'Tiến độ sử dụng',
    predictionsUsed: 'Dự đoán đã dùng',
    resetNotice: 'Hạn mức sẽ tự động reset vào đầu tháng tới.',
    paymentMethods: 'Phương thức thanh toán',
    noPaymentMethod: 'Chưa có phương thức thanh toán nào được kết nối.',
    addPayment: 'Thêm phương thức mới +',
    billingHistory: 'Lịch sử hóa đơn',
    noBillingHistory: 'Chưa có giao dịch nào phát sinh.',
    viewAll: 'Xem tất cả',
    using: 'Đang sử dụng',
    upgradeDesc: 'Không giới hạn kiểm tra + API',
    upgradeNow: 'Nâng Cấp Ngay',
    signOut: 'Đăng Xuất',
    freePlan: '✓ Gói Miễn Phí',
    proPlan: '⭐ Gói Pro',

    // Dashboard home
    dashboardTitle: 'Bảng Điều Khiển',
    dashboardSubtitle: 'Tổng quan kiểm tra của bạn',
    totalInspections: 'Tổng Kiểm Tra',
    thisMonth: 'Tháng Này',
    avgConfidence: 'Độ Chính Xác TB',
    mostCommonDefect: 'Lỗi Phổ Biến Nhất',
    monthlyUsage: 'Sử Dụng Tháng Này',
    unlimited: 'Không Giới Hạn — Gói Pro',
    inspectionsUsed: 'lần đã dùng',
    usageWarning: 'lần còn lại',
    loadingDashboard: 'Đang tải bảng điều khiển...',
    newInspection: 'Kiểm Tra Mới',
    newInspectionDesc: 'Tải ảnh lên để phân tích',
    viewHistory: 'Xem Lịch Sử',
    viewHistoryDesc: 'Duyệt các kiểm tra trước',
    defectBreakdown: 'Phân Tích Loại Lỗi',
    noInspections: 'Chưa có kiểm tra nào',
    noInspectionsDesc: 'Tải ảnh sản phẩm đầu tiên để bắt đầu',
    startFirstInspection: 'Bắt Đầu Kiểm Tra',
    resets: 'Làm mới',

    analysisResult: 'Kết Quả Phân Tích',
    confidence: 'Độ tin cậy',
    processingTime: 'Thời gian xử lý',
    detailScores: 'Tỉ lệ lỗi chi tiết',
    visualInspection: 'Kiểm tra Trực quan',
    aiSurfaceDetection: 'Sử dụng AI để phát hiện lỗi bề mặt trong tích tắc.',
    perfectSurface: 'Bề mặt Hoàn hảo',
    anomalyDetected: 'Phát hiện Bất thường',
    perfectDesc: 'Không phát hiện thấy dấu hiệu hư hỏng hoặc lỗi bề mặt nào.',
    anomalyDesc: 'Hệ thống đã phát hiện các dấu hiệu không đồng nhất. Vui lòng kiểm tra lại.',

    // Inspect page
    inspectTitle: 'Kiểm Tra Ảnh',
    inspectSubtitle: 'Tải ảnh sản phẩm để phát hiện lỗi bằng AI',
    dropImageOrBrowse: 'Thả ảnh vào đây hoặc nhấn để chọn',
    dropHere: 'Thả vào đây',
    fileFormats: 'JPEG, PNG, WEBP · Tối đa 10MB',
    analyzeImage: '🔍 Phân Tích Ảnh',
    analyzing: 'Đang phân tích...',
    reset: 'Đặt Lại',
    resultsAppearHere: 'Kết quả phân tích sẽ hiển thị ở đây',
    runningAI: 'Đang chạy phân tích AI...',
    typicallyUnder: 'Thường mất dưới 200ms',
    noDefectsDetected: 'Không phát hiện lỗi',
    defectDetected: 'Phát hiện lỗi',
    scoreBreakdown: 'CHI TIẾT ĐIỂM SỐ',

    // Webcam
    useCamera: 'Dùng Camera',
    useUpload: 'Tải Tệp Lên',
    capture: 'Chụp & Phân Tích',
    retake: 'Chụp Lại',
    cameraError: 'Không thể truy cập Camera hoặc không tìm thấy thiết bị',

    // History page
    historyTitle: 'Lịch Sử Kiểm Tra',
    totalInspectionsLabel: 'tổng lần kiểm tra',
    loading: 'Đang tải...',
    file: 'Tệp',
    result: 'Kết Quả',
    speed: 'Tốc Độ',
    date: 'Ngày',
    prev: '← Trước',
    next: 'Tiếp →',
    page: 'Trang',
    of: 'của',
    noHistory: 'Chưa có lịch sử',
    noHistoryDesc: 'Thực hiện kiểm tra đầu tiên để xem kết quả tại đây',
    startInspecting: 'Bắt Đầu Kiểm Tra',

    // Usage page
    usageTitle: 'Sử Dụng & Gói',
    usageSubtitle: 'Quản lý gói đăng ký và theo dõi mức sử dụng',
    thisMonthsUsage: 'Sử Dụng Tháng Này',
    currentPlan: 'Gói Hiện Tại',
    unlimitedInspections: '✓ Không giới hạn kiểm tra',
    resetsOn: 'Làm mới vào',
    cancels: 'Hủy vào',
    renews: 'Gia hạn vào',
    cancelWarning: '⚠️ Gói của bạn sẽ bị hủy vào cuối kỳ thanh toán',
    upgradeBtnLabel: '⭐ Nâng Cấp Pro — $29/tháng',
    redirecting: 'Đang chuyển hướng...',
    cancelSubscription: 'Hủy Đăng Ký',
    canceling: 'Đang hủy...',
    remaining: 'còn lại',
    percentUsed: 'đã dùng',
    planComparison: 'So Sánh Gói',
    feature: 'Tính Năng',
    free: 'Miễn Phí',
    pro: 'Pro',
    planRows: [
      { feature: 'Kiểm tra / tháng', free: '50', pro: 'Không giới hạn' },
      { feature: 'Lưu lịch sử', free: '7 ngày', pro: '90 ngày' },
      { feature: 'Truy cập REST API', free: '✗', pro: '✓' },
      { feature: 'Hàng đợi ưu tiên', free: '✗', pro: '✓' },
      { feature: 'Hỗ trợ ưu tiên', free: '✗', pro: '✓' },
      { feature: 'Giá', free: '$0/tháng', pro: '$29/tháng' },
    ],
  },
} as const;

export type Translations = typeof translations.en | typeof translations.vi;

// ── Context ───────────────────────────────────────────────────────────────────
interface LanguageContextType {
  lang: Lang;
  t: Translations;
  toggle: () => void;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'vi',
  t: translations.vi,
  toggle: () => {},
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>('vi');
  const toggle = () => setLang((l) => (l === 'en' ? 'vi' : 'en'));

  return (
    <LanguageContext.Provider value={{ lang, t: translations[lang], toggle }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}

export { translations };
