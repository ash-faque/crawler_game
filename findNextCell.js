module.exports = function findNextCell(dir, headCell){
    let x = headCell[0],
        y = headCell[1],
        headsTo = headCell[2],
        nextCell = [];


    // snake steps
    if (dir === -1){
        // next move left
        if (headsTo === 0){
            // currently to left
            let s;
            if ((y+1) > 5){
                s = 0;
            } else {
                s = (y+1)
            };
            nextCell = [x, s, 3]
        } else if (headsTo === 1){
            // currently to top
            let s;
            if ((x - 1) < 0){
                s = 5;
            } else {
                s = (x - 1)
            };
            nextCell = [s, y, 0]
        } else if (headsTo === 2){
            // currently to right
            let s;
            if ((y-1) < 0){
                s = 5;
            } else {
                s = (y-1)
            };
            nextCell = [x, s, 1]
        } else if (headsTo === 3){
            // currently to bottom
            let s;
            if ((x + 1) > 5){
                s = 0;
            } else {
                s = (x + 1)
            };
            nextCell = [s, y, 2]
        };



    } else if (dir === 1){
        // next move right
        if (headsTo === 0){
            // currently to left
            let s;
            if ((y-1) < 0){
                s = 5;
            } else {
                s = (y-1)
            };
            nextCell = [x, s, 1]
        } else if (headsTo === 1){
            // currently to top
            let s;
            if ((x + 1) > 5){
                s = 0;
            } else {
                s = (x + 1)
            };
            nextCell = [s, y , 2]
        } else if (headsTo === 2){
            // currently to right
            let s;
            if ((y+1) > 5){
                s = 0;
            } else {
                s = (y+1)
            };
            nextCell = [x , s, 3]
        } else if (headsTo === 3){
            // currently to bottom
            let s;
            if ((x - 1) < 0){
                s = 5;
            } else {
                s = (x - 1)
            };
            nextCell = [s, y , 0]
        };

        

    } else if (dir === 0 ){
        // next move forward
        if (headsTo === 0){
            // currently to left
            let s;
            if ((x - 1) < 0){
                s = 5;
            } else {
                s = (x - 1)
            };
            nextCell = [s, y , 0]
        } else if (headsTo === 1){
            // currently to top
            let s;
            if ((y-1) < 0){
                s = 5;
            } else {
                s = (y-1)
            };
            nextCell = [x , s, 1]
        } else if (headsTo === 2){
            // currently to right
            let s;
            if ((x + 1) > 5){
                s = 0;
            } else {
                s = (x + 1)
            };
            nextCell = [s, y , 2]
        } else if (headsTo === 3){
            // currently to bottom
            let s;
            if ((y+1) > 5){
                s = 0;
            } else {
                s = (y+1)
            };
            nextCell = [x , s, 3]
        };
    };
    return nextCell;
};