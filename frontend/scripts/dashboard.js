/* globals Chart:false, feather:false */

(function () {
  'use strict'

  feather.replace()

  // Graphs
  let ctx = document.getElementById('my-chart')

  // eslint-disable-next-line no-unused-vars
  let mychart = new Chart(ctx, {
    type: 'line',
    data: {
      datasets: [{
        data: data,
        lineTension: 0,
        backgroundColor: 'transparent',
        borderColor: '#007bff',
        borderWidth: 4,
        pointBackgroundColor: '#007bff'
      }]
    },
    options: {
      scales: {
        yAxes: [{
          ticks: {
            beginAtZero: false
          }
        }],
        xAxes: [{
          type: 'time',
          position: 'bottom',
          time: {
            displayFormats: {'day': 'MM/YY'},
            tooltipFormat: 'DD/MM/YY',
            unit: 'week',
           }
        }],
      },
      legend: {
        display: false
      }
    }
  })
}())
