export function transformProjects(projects) {
  const vineData = {};
  Object.entries(projects).forEach(([year, data]) => {
    vineData[year] = { yearIndex: data.yearIndex || 0 };
    data.forEach(project => {
      if (!vineData[year][project["ParentVine"]]) {
        vineData[year][project["ParentVine"]] = [];
      }
      vineData[year][project["ParentVine"]].push(project);
    });
  });

  Object.keys(vineData).forEach((year, index) => {
    vineData[year].yearIndex = index;
  });
  console.log("Transformed Vine Data:", vineData);
  return vineData;
}
