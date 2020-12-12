var sports = ["Golf", "Cricket", "Tennis", "Swimming"];
for (var i = 0; i < sports.length; i++) {
    console.log(sports[i]);
}
for (var _i = 0, sports_1 = sports; _i < sports_1.length; _i++) {
    var sport = sports_1[_i];
    if (sport == "Cricket") {
        console.log(sport + " is my favorite sports");
    }
    else {
        console.log(sport);
    }
}
