import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

/**
 * Excel导出工具类
 * 用于热力学计算结果的Excel文件导出
 */
export class ExcelExporter {
    constructor() {
        this.workbook = XLSX.utils.book_new();
    }

    /**
     * 添加工作表
     * @param {string} sheetName - 工作表名称
     * @param {Array} data - 数据数组
     * @param {Object} options - 选项
     */
    addWorksheet(sheetName, data, options = {}) {
        const worksheet = XLSX.utils.json_to_sheet(data, options);

        // 设置列宽
        if (options.columnWidths) {
            worksheet['!cols'] = options.columnWidths.map(width => ({ wch: width }));
        }

        // 设置行高
        if (options.rowHeights) {
            worksheet['!rows'] = options.rowHeights.map(height => ({ hpt: height }));
        }

        XLSX.utils.book_append_sheet(this.workbook, worksheet, sheetName);
    }

    /**
     * 添加表格数据工作表
     * @param {string} sheetName - 工作表名称
     * @param {Array} tableData - 表格数据
     * @param {Array} headers - 表头配置
     */
    addTableSheet(sheetName, tableData, headers) {
        // 转换数据格式
        const formattedData = tableData.map(row => {
            const newRow = {};
            headers.forEach(header => {
                newRow[header.label] = row[header.prop] || '';
            });
            return newRow;
        });

        this.addWorksheet(sheetName, formattedData, {
            columnWidths: headers.map(h => h.width || 15)
        });
    }

    /**
     * 添加相图数据工作表
     * @param {string} sheetName - 工作表名称
     * @param {Object} chartData - 图表数据
     */
    addChartDataSheet(sheetName, chartData) {
        const data = [];

        if (chartData.series && chartData.series.length > 0) {
            // 获取所有数据点
            const allDataPoints = [];
            chartData.series.forEach(series => {
                if (series.data) {
                    series.data.forEach(point => {
                        allDataPoints.push({
                            '系列名称': series.name,
                            'X轴': point[0],
                            'Y轴': point[1],
                            '数据类型': series.type || 'line'
                        });
                    });
                }
            });

            this.addWorksheet(sheetName, allDataPoints, {
                columnWidths: [15, 12, 12, 12]
            });
        }
    }

    /**
     * 添加热力学性质数据
     * @param {string} sheetName - 工作表名称
     * @param {Object} properties - 热力学性质数据
     */
    addPropertiesSheet(sheetName, properties) {
        const data = Object.entries(properties).map(([key, value]) => ({
            '性质名称': this.getPropertyName(key),
            '数值': value,
            '单位': this.getPropertyUnit(key)
        }));

        this.addWorksheet(sheetName, data, {
            columnWidths: [20, 15, 12]
        });
    }

    /**
     * 添加计算参数工作表
     * @param {string} sheetName - 工作表名称
     * @param {Object} parameters - 计算参数
     */
    addParametersSheet(sheetName, parameters) {
        const data = [];

        // 递归处理嵌套对象
        const flattenObject = (obj, prefix = '') => {
            Object.entries(obj).forEach(([key, value]) => {
                const paramName = prefix ? `${prefix}.${key}` : key;

                if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                    flattenObject(value, paramName);
                } else {
                    data.push({
                        '参数名称': this.getParameterName(paramName),
                        '参数值': Array.isArray(value) ? value.join(', ') : value,
                        '参数类型': typeof value
                    });
                }
            });
        };

        flattenObject(parameters);

        this.addWorksheet(sheetName, data, {
            columnWidths: [25, 20, 12]
        });
    }

    /**
     * 添加计算日志工作表
     * @param {string} sheetName - 工作表名称
     * @param {Array} logs - 计算日志
     */
    addLogsSheet(sheetName, logs) {
        const data = logs.map(log => ({
            '时间': log.time,
            '级别': log.level,
            '消息': log.message
        }));

        this.addWorksheet(sheetName, data, {
            columnWidths: [15, 8, 40]
        });
    }

    /**
     * 导出Excel文件
     * @param {string} filename - 文件名
     */
    export(filename) {
        // 检查工作簿是否为空
        if (Object.keys(this.workbook.Sheets || {}).length === 0) {
            // 如果为空，添加一个默认的工作表
            const defaultSheet = XLSX.utils.aoa_to_sheet([["无数据"]]);
            XLSX.utils.book_append_sheet(this.workbook, defaultSheet, "无数据");
        }

        const excelBuffer = XLSX.write(this.workbook, {
            bookType: 'xlsx',
            type: 'array'
        });

        const data = new Blob([excelBuffer], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        });

        saveAs(data, `${filename}_${this.getTimestamp()}.xlsx`);
    }

    /**
     * 获取时间戳
     */
    getTimestamp() {
        const now = new Date();
        return now.getFullYear() +
            String(now.getMonth() + 1).padStart(2, '0') +
            String(now.getDate()).padStart(2, '0') + '_' +
            String(now.getHours()).padStart(2, '0') +
            String(now.getMinutes()).padStart(2, '0') +
            String(now.getSeconds()).padStart(2, '0');
    }

    /**
     * 获取性质中文名称
     */
    getPropertyName(key) {
        const names = {
            formationEnthalpy: '形成焓',
            bindingEnergy: '结合能',
            bulkModulus: '体积模量',
            transitionTemp: '相变温度',
            transitionEnthalpy: '相变焓',
            stability: '稳定性',
            totalEnergy: '总能量',
            entropy: '熵',
            volume: '体积',
            heatCapacity: '热容',
            chemicalPotential1: '化学势μ₁',
            chemicalPotential2: '化学势μ₂'
        };
        return names[key] || key;
    }

    /**
     * 获取性质单位
     */
    getPropertyUnit(key) {
        const units = {
            formationEnthalpy: 'kJ/mol',
            bindingEnergy: 'eV/atom',
            bulkModulus: 'GPa',
            transitionTemp: 'K',
            transitionEnthalpy: 'kJ/mol',
            stability: '-',
            totalEnergy: 'J/mol',
            entropy: 'J/(mol·K)',
            volume: 'm³/mol',
            heatCapacity: 'J/(mol·K)',
            chemicalPotential1: 'J/mol',
            chemicalPotential2: 'J/mol'
        };
        return units[key] || '-';
    }

    /**
     * 获取参数中文名称
     */
    getParameterName(key) {
        const names = {
            system: '合金系统',
            database: '数据库',
            tempMin: '最低温度',
            tempMax: '最高温度',
            compMin: '最低组分',
            compMax: '最高组分',
            precision: '计算精度',
            modelType: '建模类型',
            method: '计算方法',
            elements: '体系组成',
            accuracy: '计算精度',
            alloySystem: '合金系统',
            components: '组分设置',
            pressure: '压力',
            calculationTypes: '计算类型',
            gridAccuracy: '网格精度',
            analysisType: '分析类型',
            workspace: '工作空间',
            condition: '计算条件'
        };
        return names[key] || key;
    }
}

/**
 * 快速导出单个工作表Excel文件
 * @param {string} filename - 文件名
 * @param {string} sheetName - 工作表名称
 * @param {Array} data - 数据
 * @param {Object} options - 选项
 */
export function exportSingleSheet(filename, sheetName, data, options = {}) {
    const exporter = new ExcelExporter();
    exporter.addWorksheet(sheetName, data, options);
    exporter.export(filename);
}

/**
 * 导出完整的热力学计算结果
 * @param {string} filename - 文件名
 * @param {Object} resultData - 结果数据
 */
export function exportThermoResults(filename, resultData) {
    const exporter = new ExcelExporter();

    // 添加计算参数
    if (resultData.parameters) {
        exporter.addParametersSheet('计算参数', resultData.parameters);
    }

    // 添加表格数据
    if (resultData.tableData) {
        exporter.addTableSheet('计算结果', resultData.tableData, resultData.tableHeaders || []);
    }

    // 添加热力学性质
    if (resultData.properties) {
        exporter.addPropertiesSheet('热力学性质', resultData.properties);
    }

    // 添加图表数据
    if (resultData.chartData) {
        exporter.addChartDataSheet('图表数据', resultData.chartData);
    }

    // 添加计算日志
    if (resultData.logs) {
        exporter.addLogsSheet('计算日志', resultData.logs);
    }

    exporter.export(filename);
}

export default ExcelExporter;