const chartData = {
  backgroundColor: '#FFFFFF',
  title: {
    text: 'Line Chart',
    textStyle: {
      color: '#1B1D1F'
    }
  },
  tooltip: {},
  legend: {
    show: true,
    data: ['Test'],
    textStyle: {
      color: '#1B1D1F',
      fontFamily: 'Century Gothic'
    },
    orient: 'horizontal',
    bottom: 'center'
  },
  xAxis: {
    data: ['Shirts', 'Cardigans', 'Jackets', 'Pants', 'Heels', 'Socks'],
    axisLabel: {
      color: '#1B1D1F',
      fontFamily: 'Century Gothic'
    },
    axisLine: {
      lineStyle: {
        color: '#1B1D1F'
      }
    }
  },
  yAxis: {
    axisLabel: {
      color: '#1B1D1F',
      fontFamily: 'Century Gothic'
    },
    splitLine: {
      show: true,
      lineStyle: {
        color: '#eee',
        type: 'dashed',
        width: 0.4
      }
    },
    axisLine: {
      lineStyle: {
        color: '#1B1D1F'
      }
    }
  },
  series: [
    {
      name: 'sales',
      type: 'line',
      data: [5, 20, 36, 10, 10, 20],
      label: {
        show: true,
        position: 'top',
        color: '#1B1D1F',
        fontFamily: 'Century Gothic'
      },
      itemStyle: {
        color: '#006350'
      }
    }
  ]
};

export default chartData;
