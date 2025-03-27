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
    return (((current - previous) / previous) * 100).toFixed(0);
}

function renderChartForMetric(metric, index) {
    // Рендерим график в контейнере с id "chart-{index}"
    Highcharts.chart(`chart-${index}`, {
        chart: { type: 'line' },
        title: { text: metric.name },
        xAxis: {
            categories: ['T-6', 'T-5', 'T-4', 'T-3', 'T-2', 'Вчера', 'Сегодня']
        },
        yAxis: { title: { text: metric.name } },
        series: [{
            name: metric.name,
            data: metric.chartData || []
        }]
    });
}

function renderTable(data) {
    const tbody = document.getElementsByClassName('table-body')[0];
    tbody.innerHTML = '';

    data.metrics.forEach((metric, index) => {
        // Основная строка (main-row)
        const mainRow = document.createElement('tr');
        mainRow.classList.add('main-row');
        mainRow.innerHTML = `
        <td><strong>${metric.name}</strong></td>
        <td>${metric.values.current}</td>
        <td>${metric.values.yesterday}</td>
        <td style="color: ${metric.values.current >= metric.values.yesterday ? 'green' : 'red'}">
            ${calculateChange(metric.values.current, metric.values.yesterday)}%
        </td>
        <td>${metric.values.weekly}</td>
      `;

        // Клик по основной строке открывает/закрывает аккордеон с графиком
        mainRow.addEventListener('click', () => {
            const chartRow = mainRow.nextElementSibling;
            chartRow.classList.toggle('expanded');
            if (chartRow.classList.contains('expanded')) {
                renderChartForMetric(metric, index);
            }
        });
        tbody.appendChild(mainRow);

        // Строка-аккордеон для графика
        const chartRow = document.createElement('tr');
        chartRow.classList.add('accordion-content');
        // По условию для первого показателя аккордеон открыт изначально
        if (index === 0) {
            chartRow.classList.add('expanded');
        }
        chartRow.innerHTML = `
        <td colspan="5">
          <div class="chart-container" id="chart-${index}" style="width: 100%; height: 400px;"></div>
        </td>
      `;
        tbody.appendChild(chartRow);

        // Если аккордеон изначально открыт, отрисовываем график
        if (chartRow.classList.contains('expanded')) {
            renderChartForMetric(metric, index);
        }

        // Если у показателя есть subitems, отрисовываем их под аккордеоном
        if (metric.subitems && Array.isArray(metric.subitems)) {
            metric.subitems.forEach(subitem => {
                const subRow = document.createElement('tr');
                subRow.classList.add('sub-item');
                subRow.innerHTML = `
            <td>${subitem.name}</td>
            <td>${subitem.values.current}</td>
            <td>${subitem.values.yesterday}</td>
            <td style="color: ${subitem.values.current >= subitem.values.yesterday ? 'green' : 'red'}">
                ${calculateChange(subitem.values.current, subitem.values.yesterday)}%
            </td>
            <td>${subitem.values.weekly}</td>
          `;
                tbody.appendChild(subRow);
            });
        }
    });
}

document.addEventListener('DOMContentLoaded', fetchData);
