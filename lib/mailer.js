'use strict'

const nodemailer = require('nodemailer')
const config     = require('config')

const smtpTransport = nodemailer.createTransport(config.smtp)

function mailer (options) {
  options = options || {}

  return {
    text: function (str) { options.text = str; return this },
    html: function (str) { options.html = str; return this },
    subject: function (sub) { options.subject = sub; return this },
    from: function (mails) { options.from = mails; return this },
    to: function (mails) { options.to = mails; return this },
    cc: function (mails) { options.cc = mails; return this },
    attach: function (filename, content) {
      options.attachments = options.attachments || []
      options.attachments.push({
        filename: filename,
        content: content
      })
      return this
    },
    send: function (callback) {
      smtpTransport.sendMail(options, callback)
      return this
    }
  }
}

module.exports = mailer
