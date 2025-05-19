# AWS Identity Center Helper
A very simple Firefox addon to automatially put console logins from AWS IAM Identity Center into their own containers, allowing you to be logged in to as many different accounts and roles as you'd like.

There is currently no configuration. It simply looks for URLs of the form ```https://*.awsapps.com/start/#/console?*``` and checks if it is in the correct container (one created by the addon), and recreates the tab in it if it is not.
