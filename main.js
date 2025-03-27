function formatNumber(num) {
    return num.toLocaleString('ru-RU');
}

async function fetchData() {
    try {
        const response = await fetch('data.json');
        const jsonData = await response.json();
        renderTable(jsonData);
    } catch (error) {
        console.error("Ошибка загрузки данных:", error);
    }
}

function calculateChange(current, previous) {
    if (previous === 0) return "∞";
    return Math.round((((current - previous) / previous) * 100));
}

function renderChartForMetric(metric, index) {
    Highcharts.chart(`chart-${index}`, {
        chart: {
            type: 'line'
        },
        title: {
            text: null
        },
        xAxis: {
            tickPositions: [0, 1, 2, 3, 4, 5, 6],
            labels: {
                enabled: false 
            },
            lineColor: '#000',
            lineWidth: 1,
            tickLength: 5,
            tickWidth: 5,
            tickColor: '#000'
        },
        yAxis: {
            title: { text: null },
            labels: { enabled: false },
            lineColor: '#000',
            lineWidth: 1,
            tickLength: 5,
            tickWidth: 5,
            tickColor: '#000',
            gridLineWidth: 0,
            tickAmount: 5
        }
        ,
        legend: {
            enabled: false
        },
        series: [{
            color: '#369673',
            data: metric.chartData || [],
            marker: {
                enabled: true,
                radius: 4
            },
            lineWidth: 1
        }]
    });
}


function renderTable(data) {
    const tbody = document.getElementsByClassName('table-body')[0];
    tbody.innerHTML = '';

    data.metrics.forEach((metric, index) => {
        const bgColorYesterday = metric.values.current >= metric.values.yesterday ? '#ECF7E7' : '#FEE6E6';
        const bgColorWeekly = metric.values.current >= metric.values.weekly ? '#ECF7E7' : '#FEE6E6';
    
        // Основная строка (main-row)
        const mainRow = document.createElement('tr');
        mainRow.classList.add('main-row');
        mainRow.innerHTML = `
            <td>${metric.name}</td>
            <td class="current">${formatNumber(metric.values.current)}</td>
            <td class="yesterday" style="background-color: ${bgColorYesterday}; position: relative;">
                ${formatNumber(metric.values.yesterday)}
                <span class="change-value" style="color:${metric.values.current >= metric.values.yesterday ? 'green' : 'red'}">
                    ${calculateChange(metric.values.current, metric.values.yesterday)}%
                </span>
            </td>
            <td class="weekly" style="background-color: ${bgColorWeekly};">
                ${formatNumber(metric.values.weekly)}
            </td>
        `;

        // Клик открывает/закрывает аккордеон с графиком
        mainRow.addEventListener('click', () => {
            const chartRow = mainRow.nextElementSibling;
            chartRow.classList.toggle('expanded');
            if (chartRow.classList.contains('expanded')) {
                renderChartForMetric(metric, index);
            }
        });
        tbody.appendChild(mainRow);

        const chartRow = document.createElement('tr');
        chartRow.classList.add('accordion-content');
        // 1й аккордеон открыт изначально
        if (index === 0) {
            chartRow.classList.add('expanded');
        }
        chartRow.innerHTML = `
            <td colspan="5">
                <div class="chart-container" id="chart-${index}" style="width: 100%; height: 400px;"></div>
            </td>
        `;
        tbody.appendChild(chartRow);

        if (chartRow.classList.contains('expanded')) {
            renderChartForMetric(metric, index);
        }

        if (metric.subitems && Array.isArray(metric.subitems)) {
            metric.subitems.forEach(subitem => {
                const bgColorYesterdaySub = subitem.values.current >= subitem.values.yesterday ? '#ECF7E7' : '#FEE6E6';
                const bgColorWeeklySub = subitem.values.current >= subitem.values.weekly ? '#ECF7E7' : '#FEE6E6';

                const subRow = document.createElement('tr');
                subRow.classList.add('sub-item');
                subRow.innerHTML = `
                    <td>${subitem.name}</td>
                    <td class="subitem-value current">${formatNumber(subitem.values.current)}</td>
                    <td class="yesterday" position: relative;">
                        ${formatNumber(subitem.values.yesterday)}
                        <span class="change-value" style="color:${subitem.values.current >= subitem.values.yesterday ? 'green' : 'red'}">
                            ${calculateChange(subitem.values.current, subitem.values.yesterday)}%
                        </span>
                    </td>
                    <td class="weekly">
                        ${formatNumber(subitem.values.weekly)}
                    </td>
                `;
                tbody.appendChild(subRow);
            });
        }
    });
}

document.addEventListener('DOMContentLoaded', fetchData);
