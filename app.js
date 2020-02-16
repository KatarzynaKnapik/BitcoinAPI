class DataGetter{
    constructor(key){
        this.key = key;
    }

    getDataAPI(){
        return new Promise( (resolve, reject) =>{
            const http = new XMLHttpRequest();
            const base = 'http://rest.coinapi.io/v1/ohlcv/BITSTAMP_SPOT_BTC_USD/history?period_id=1DAY&time_start=2017-01-01T00:00:00&limit=100000';
            const rest = `&apikey=${key}`;
            const path = base + rest;
    
            http.addEventListener('readystatechange', () =>{
                if(http.readyState === 4 && http.status === 200){
                    const data = JSON.parse(http.responseText);
                    resolve(data);
                }else if(http.readyState === 4){
                    reject('error getting data');
                }
            })
            http.open('GET', path);
            http.send();
        });
    }

    getTimes(data){
        let times = new Array(data.length);
        for(let i=0; i<times.length; i++){
            times[i] = data[i].time_period_start.substring(0,10);
        }
        return times;
    }
    
    getPrices(data){ return data.map(p => p.price_close)}

    getData(callback){
        let data_storage = this.getDataFromLocalStorage();
        if(data_storage === null) {
            this.getDataAPI().then(data => {
                console.log(data);
                localStorage.setItem('data', JSON.stringify(data));
                callback(data, undefined);
            }).catch(error => {
                console.log('some error', error);
                callback(undefined, error);
            });    
        }else{
            callback(JSON.parse(data_storage), undefined);
        }
    }

    getDataFromLocalStorage(){
        return localStorage.getItem('data');
    }
}


const key = '5F434E5F-0639-46A5-9430-4D3088CE35AD';
// const key = '2C5F7FCE-1AD6-4D83-8DF8-CA02D4C099E6';
const d_g = new DataGetter(key);

class ChartDrawer{
    constructor(prices){
        this.prices = prices;
        this.myChart = document.getElementById('myChart').getContext('2d'); 
    }

    drawChart(){
        new Chart(this.myChart, {
            type: 'line',
            data: {
                labels: d_g.getTimes(this.prices),
                datasets: [{
                    label: 'BTC Prices in USD',
                    data: d_g.getPrices(this.prices),
                    backgroundColor: 'rgba(255,255,255,1.0)',
                    pointStyle: 'line',
                    radius: 1,
                    pointBackgroundColor: 'rgba(0,0,0,1)'
                }]
            },
            options: {
                layout: {
                    padding: {
                        left: 10,
                        right: 10,
                        top: 10,
                        bottom: 10
                    }
                }    
            },
        });
    }  
}

d_g.getData((data, error) => {
    const cd = new ChartDrawer(data);
    cd.drawChart();
});



