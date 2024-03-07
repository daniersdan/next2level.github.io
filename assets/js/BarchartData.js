const chartData = {
  //backgroundColor: '#FFFFFF',
  title: {
    text: 'Bar Chart',
    textStyle: {
      color: '#1B1D1F'
    }
  },
  tooltip: {},
  legend: {
    show: true,
    data: ['sales'],
    textStyle: {
      color: '#1B1D1F',
      fontFamily: 'Century Gothic'
    },
    orient: 'horizontal',
    bottom: true
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
      type: 'bar',
      data: [5, 20, 36, 10, 10, 20],
      label: {
        show: true,
        position: 'top',
        color: '#1B1D1F',
        fontFamily: 'Century Gothic'
      },
      itemStyle: {
        color: new echarts.graphic.LinearGradient(
          0, 0.5, 1, 0.5,
          [
            { offset: 0.05, color: '#FFFFFF' },
            { offset: 0.1, color: '#006350' },
            { offset: 0.5, color: '#00A383' },
            { offset: 0.9, color: '#006350' },
            { offset: 0.95, color: '#FFFFFF' }
          ]
        )
      }
    }
  ]
};

export default chartData;
