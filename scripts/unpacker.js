var entities = {}; // using a centralized dictionary as fields of OverflowGateEntity are private
function convert(entity) {
    if (entities[entity.id] == undefined) {
        entities[entity.id] = {lastItem: null, lastInput: null, time: 0, items: entity.items}
    }
    return entities[entity.id]
}
const overflow = Vars.content.getByName(ContentType.block, 'overflow-gate');
 
const unpacker = extendContent(OverflowGate, "unpacker", {
	
	// copy of the original method, modified to use the centralized dictionary
    removeStack(tile, item, amount){
        var entity = convert(tile.ent());
        var result = overflow.removeStack(tile, item, amount);
        if(result != 0 && item == entity.lastItem){
            entity.lastItem = null;
        }
        return result;
    },
	
	// copy of the original method, modified to use the centralized dictionary
    acceptItem(item, tile, source){
        var entity = convert(tile.ent());
 
        return tile.getTeam() == source.getTeam() && entity.lastItem === null && entity.items.total() == 0;
    },
	
	// copy of the original method, modified to use the centralized dictionary
    handleItem(item, tile, source){
        var entity = convert(tile.ent());
        entity.items.add(item, 1);
        entity.lastItem = item;
        entity.time = 0;
        entity.lastInput = source;
    },
 
    update(tile) {
        var entity = convert(tile.ent());
        if (entity.lastItem === null && entity.items.total() > 0) {
            entity.items.clear();
        }
        var getTargetAndFlip = (tile, item, src) => {
            var incomingDirection = tile.relativeTo(src.x, src.y);
            if (incomingDirection === -1) return null;
 
            var outputCandidates = [[1,3,2], [3,1,2]][tile.rotation() % 2]
               .map((dir) => tile.getNearby((incomingDirection + dir) % 4));
               
            var output = outputCandidates
                .filter((t) => t !== null)
                .filter((t) => !(t.block() instanceof OverflowGate))
                .filter((t) => t.block().acceptItem(item, t, tile))
                [0];
            if (output === undefined) return null;
            
            if (output === outputCandidates[0]) {
                tile.rotation((!tile.rotation())|0);
            }
            return output;
        }
		
		entity.time += 1 / overflow.speed * Time.delta();
		
        if(entity.lastItem !== null && entity.time >= 1){
            var target = getTargetAndFlip(tile, entity.lastItem, entity.lastInput);
            if (target === null) return;
            var itemo = Items.blastCompound
            /*var converts = [
                [Vars.content.item(0), Vars.content.getByName(ContentType.items, "testing...-packedCopper")]
                [Vars.content.item(1), Vars.content.getByName(ContentType.items, "testing...-packedLead")]
            ]
            converts.forEach(ent) => {
                if (ent[0] === entity.lastItem)
                    itemo = ent[1]
            }*/
            if (entity.lastItem === Vars.content.getByName(ContentType.item,  "garbagecan-packedCopper")) {
                itemo = Items.copper
            } else if (entity.lastItem === Vars.content.getByName(ContentType.item,  "garbagecan-packedLead")) {
                itemo = Items.lead
            }
            //output = Items.blastCompound //Vars.content.item(15)
            //if (!itemo) itemo = Items.blastCompound
            for (var i = 0; i < 5; i++) {
                target.block().handleItem(itemo, target, tile);
            }
            entity.items.remove(entity.lastItem, 1);
            entity.lastItem = null;
        }
    }
})
