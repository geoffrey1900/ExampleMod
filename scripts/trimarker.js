var tile_instance_sp = {};

const spinnerLaunchEffect = newEffect(50, e => {
    var i = 4;
    Draw.color(Color.red, Color.cyan, e.fin());
    Lines.stroke(e.fout() * 5);
    var key = e.x + "," + e.y;
    if(tile_instance_sp[key] === undefined){
        tile_instance_sp[key] = 0;
    }
    Lines.poly(e.x, e.y, i, e.fin() * 50, tile_instance_sp[key]);
    tile_instance_sp[key]++;
});

var cd = 60;
var lvl = 1;
var cd = 60;
const spinner = extendContent(Block, "spinner", {
    update(tile) {
            //cooldown of 60 ticks
            if (cd > 0) {
                cd--;
            }
            else {
                cd = 60;
                tile.entity.health -= 10;
                Effects.effect(spinnerLaunchEffect, tile);
                for (var i = 0; i < 12; i++) {
                Calls.createBullet(
                    Bullets.flakExplosive, 
                    tile.getTeam(), 
                    tile.drawx(), 
                    tile.drawy(), 
                    Mathf.random(-12, 12) + (tile.entity.rotation * 90), 
                    Mathf.random(0.5, 1.0), 
                    Mathf.random(0.2, 1.0)
                )};
            };
    }
})