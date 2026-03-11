# Feature Specification: Project Core Specification (v2.0)

**Feature Branch**: `001-project-specification`  
**Created**: 2026-03-11  
**Status**: Draft  
**Input**: User description: "Comprehensive project specification for the PDF Invoice Tool (v2.0)"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - 批次上傳與解析 (Priority: P1)

使用者希望能夠一次上傳多個 PDF 發票檔案，系統應自動識別其中的關鍵資訊（如單號、發票號、日期與金額），並正確處理格式轉換。

**Why this priority**: 這是工具的核心價值，解決人工手動輸入的低效率問題。

**Independent Test**: 上傳包含不同月份、不同樣式的「中國附醫」PDF 發票，驗證解析結果的準確性。

**Acceptance Scenarios**:

1. **Given** 使用者在歡迎頁面，**When** 拖入 5 個 PDF 檔案時，**Then** 系統應顯示解析進度條，並正確識別所有單號。
2. **Given** 包含民國日期（如 112/01/01）的發票，**When** 解析完成時，**Then** 日期應被轉換為西元格式（20230101）。
3. **Given** 金額包含千分位（如 1,234.50），**When** 解析完成時，**Then** 應提取為純數字格式以便計算。

---

### User Story 2 - 數據 Dashboard 檢視與過濾 (Priority: P2)

使用者希望在解析完成後，能透過 Dashboard 直觀地看到按月份分類的數據彙總，並能快速找到特定月份的詳細記錄。

**Why this priority**: 提供直觀的數據整理能力，減少使用者再整理的時間。

**Independent Test**: 在結果頁面切換不同月份，驗證詳細清單是否隨之更新。

**Acceptance Scenarios**:

1. **Given** 解析完成後進入結果頁面，**When** 點擊左側「1月」按鈕時，**Then** 右側應僅顯示 1 月份的詳細發票清單。
2. **Given** 多個月份的數據，**When** 檢視統計卡片時，**Then** 應正確顯示「總金額」、「有效記錄數」及「掃描頁數」。

---

### User Story 3 - 數據導出至 Excel (Priority: P2)

使用者希望將整理好的數據導出為格式正確的 Excel 檔案，以便後續的會計或報表作業。

**Why this priority**: 與現有辦公環境（Excel）接軌的必要功能。

**Independent Test**: 點擊「導出為 Excel」，驗證生成的 .xlsx 檔案內容格式。

**Acceptance Scenarios**:

1. **Given** 在結果頁面，**When** 點擊「導出為 Excel」時，**Then** 應下載一個 .xlsx 檔案，內部包含按月份排序的數據。

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: 系統必須支援多檔案拖放 (Drag & Drop) 上傳功能。
- **FR-002**: 系統必須識別正則表達式為 `[A-Z]{2}\d{8}` 的驗退收單號與發票號碼。
- **FR-003**: 系統必須自動將民國日期格式（yyy/MM/dd）轉換為西元格式（YYYYMMDD）。
- **FR-004**: 系統必須處理金額欄位，移除千分位符號並保留精確數值。
- **FR-005**: 伺服器端不應保留任何上傳的 PDF 檔案（純前端解析，隱私安全）。
- **FR-006**: 系統必須提供 Dashboard 介面，按月份對發票數據進行分類彙整。
- **FR-007**: 系統必須支援將解析結果導出為標準 Excel 格式。

### Key Entities

- **InvoiceData**: 代表單張發票的提取資訊。包含：單號、發票號、西元日期、金額、所屬月份。
- **ExtractionState**: 代表目前的解析任務狀態。包含：總檔案數、已處理數、當前狀態（Idle, Loading, Success, Error）。

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 使用者從上傳 10 份文件到看到完整統計結果的時間應在 10 秒內。
- **SC-002**: 發票號碼與金額的自動提取準確度應達到 100%（針對格式正確的中國附醫發票）。
- **SC-003**: 使用者在解析後 3 次點擊內即可完成 Excel 導出作業。
- **SC-004**: 系統應支援在現代主流瀏覽器（Chrome, Edge, Safari）上流暢運行，延遲低於 100ms。
