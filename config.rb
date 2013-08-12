#########################
## Asset Paths are defined by the system, you should not include them here.
##
## If you would like to change them, please edit .system.json
#########################

# Require any additional compass plugins here.


# Change this to :production when ready to deploy the CSS to the live server.
# Note: If you are using grunt.js, these variables will be overriden.
environment = :development
#environment = :production

# To enable relative paths to assets via compass helper functions. Since Drupal themes can be installed in multiple locations, we shouldn't need to worry about the absolute path to the theme from the server root.
relative_assets = true

# To enable debugging comments that display the original location of your selectors. Comment:
line_comments = false

# In development, we can turn on the debug_info to use with FireSass or Chrome Web Inspector. Uncomment:
# debug = true

#########################
## You probably don't need to edit anything below this.
#########################

# Disable cache busting on image assets
asset_cache_buster :none

# You can select your preferred output style here (can be overridden via the command line):
# output_style = :expanded or :nested or :compact or :compressed
output_style = (environment == :development) ? :expanded : :compressed

# Pass options to sass. For development, we turn on the FireSass-compatible
# debug_info if the debug config variable above is true.
sass_options = (environment == :development && debug == true) ? {:debug_info => true} : {}