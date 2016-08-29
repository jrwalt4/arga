var gulp = require("gulp");

var prj_name = "arga";
var out_file_name = "arga.js";
var min_file_name = "arga.min.js";
var out_dir = "build";


gulp.task('gulp-test', function() {
    return gulp.src('LICENSE')
        .pipe(wrap("<%=result.name%> says:\n <%=result.contents%>", {name:"Reese"}, {variable:'result'}))
        .pipe(gulp.dest('build/test'));
})

gulp.task('build-ts', function() {
    var tsc = require('gulp-typescript');
    var concat = require('gulp-concat');
    var wrap = require('gulp-wrap');
    var tsProject = tsc.createProject('tsconfig.json');
    return tsProject.src()
        .pipe(tsc(tsProject)).js
        .pipe(concat(out_file_name))
        .pipe(wrap(
            {src:'build/build-template.tpl'}, 
            {title:prj_name}, 
            {variable:'result'})
        )
        .pipe(gulp.dest(out_dir));
})

gulp.task('build', ['build-ts'])

gulp.task('dist', ['build'], function() {
    var rename = require("gulp-rename");
    var beautify = require("gulp-beautify");
    var uglify = require("gulp-uglify");
    var merge = require('merge-stream');
    var main = gulp.src(out_dir+"/"+out_file_name)
        .pipe(beautify())
        .pipe(gulp.dest(out_dir));
    var min = main
        .pipe(uglify())
        .pipe(rename('arga.min.js'))
        .pipe(gulp.dest(out_dir));

    return merge(main, min);
})

gulp.task('default', ['build'])